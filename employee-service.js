/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Employee Service - Multi-tenant employee management
 * ============================================================
 * All queries are scoped by companyId for tenant isolation.
 * Preserves all existing employee functionality.
 */

import { db } from '../config/firebase-init.js';
import { COLLECTIONS } from '../config/firebase-config.js';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDoc, getDocs, query, where, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentCompanyId = null;

/**
 * Set the current company context for all employee queries
 * @param {string} companyId
 */
export function setEmployeeCompany(companyId) {
  currentCompanyId = companyId;
}

/**
 * Ensure companyId is set
 * @throws {Error}
 */
function requireCompany() {
  if (!currentCompanyId) {
    throw new Error('Company context not set. Call setEmployeeCompany() first.');
  }
}

/**
 * Build a company-scoped employees collection reference
 * @returns {import("firebase/firestore").CollectionReference}
 */
function getEmployeesRef() {
  requireCompany();
  return collection(db, COLLECTIONS.COMPANIES, currentCompanyId, COLLECTIONS.EMPLOYEES);
}

/**
 * Listen to all employees for the current company
 * @param {Function} callback - Called with array of employees
 * @returns {Function} Unsubscribe function
 */
export function listenToEmployees(callback) {
  requireCompany();
  const q = query(getEmployeesRef(), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const employees = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(employees);
  }, (error) => {
    console.error('Employees listener error:', error);
  });
}

/**
 * Add an employee to the current company
 * @param {Object} employeeData 
 * @returns {Promise<string>}
 */
export async function addEmployee(employeeData) {
  requireCompany();
  try {
    const data = {
      ...employeeData,
      companyId: currentCompanyId,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(getEmployeesRef(), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
}

/**
 * Update an employee
 * @param {string} employeeId 
 * @param {Object} updates 
 */
export async function updateEmployee(employeeId, updates) {
  requireCompany();
  try {
    updates.updatedAt = new Date().toISOString();
    await updateDoc(doc(getEmployeesRef(), employeeId), updates);
    return true;
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
}

/**
 * Delete an employee
 * @param {string} employeeId 
 */
export async function deleteEmployee(employeeId) {
  requireCompany();
  try {
    await deleteDoc(doc(getEmployeesRef(), employeeId));
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
}

/**
 * Get a single employee
 * @param {string} employeeId 
 * @returns {Promise<Object|null>}
 */
export async function getEmployee(employeeId) {
  requireCompany();
  try {
    const snap = await getDoc(doc(getEmployeesRef(), employeeId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting employee:', error);
    return null;
  }
}

/**
 * Get employees by department
 * @param {string} department 
 * @returns {Promise<Array>}
 */
export async function getEmployeesByDepartment(department) {
  requireCompany();
  try {
    const q = query(getEmployeesRef(), where('dept', '==', department));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting employees by department:', error);
    return [];
  }
}

/**
 * Search employees by name, email, ID, or department
 * @param {string} searchTerm 
 * @returns {Promise<Array>}
 */
export async function searchEmployees(searchTerm) {
  requireCompany();
  try {
    const snap = await getDocs(getEmployeesRef());
    const term = searchTerm.toLowerCase();
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(e =>
        (e.name || '').toLowerCase().includes(term) ||
        (e.email || '').toLowerCase().includes(term) ||
        (e.idNum || '').toLowerCase().includes(term) ||
        (e.dept || '').toLowerCase().includes(term) ||
        (e.code || '').toLowerCase().includes(term)
      );
  } catch (error) {
    console.error('Error searching employees:', error);
    return [];
  }
}

/**
 * Get total employee count for current company
 * @returns {Promise<number>}
 */
export async function getEmployeeCount() {
  requireCompany();
  try {
    const snap = await getDocs(getEmployeesRef());
    return snap.size;
  } catch (error) {
    console.error('Error counting employees:', error);
    return 0;
  }
}

/**
 * Subscribe to employee count changes
 * @param {Function} callback 
 * @returns {Function} Unsubscribe function
 */
export function listenToEmployeeCount(callback) {
  requireCompany();
  return onSnapshot(getEmployeesRef(), (snapshot) => {
    callback(snapshot.size);
  });
}