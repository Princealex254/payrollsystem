/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Payroll Service - Multi-tenant payroll management
 * ============================================================
 * All payroll queries are scoped by companyId for tenant isolation.
 * Preserves all existing payroll calculation and storage logic.
 */

import { db } from '../config/firebase-init.js';
import { COLLECTIONS } from '../config/firebase-config.js';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDoc, getDocs, query, where, orderBy, limit, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentCompanyId = null;

export function setPayrollCompany(companyId) {
  currentCompanyId = companyId;
}

function requireCompany() {
  if (!currentCompanyId) {
    throw new Error('Company context not set. Call setPayrollCompany() first.');
  }
}

function getPayrollRef() {
  requireCompany();
  return collection(db, COLLECTIONS.COMPANIES, currentCompanyId, COLLECTIONS.PAYROLL);
}

/**
 * Listen to all payroll records for the current company
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function listenToPayroll(callback) {
  requireCompany();
  const q = query(getPayrollRef(), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(records);
  }, (error) => {
    console.error('Payroll listener error:', error);
  });
}

/**
 * Listen to payroll records for a specific month/year
 * @param {string} month
 * @param {number} year
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function listenToPayrollByPeriod(month, year, callback) {
  requireCompany();
  const q = query(
    getPayrollRef(),
    where('month', '==', month),
    where('year', '==', year),
    orderBy('employeeName')
  );
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(records);
  }, (error) => {
    console.error('Payroll period listener error:', error);
  });
}

/**
 * Save a payroll record
 * @param {Object} payrollData
 * @returns {Promise<string>}
 */
export async function savePayroll(payrollData) {
  requireCompany();
  try {
    const data = {
      ...payrollData,
      companyId: currentCompanyId,
      status: 'completed',
      updatedAt: new Date().toISOString(),
      createdAt: payrollData.createdAt || new Date().toISOString()
    };
    if (payrollData.id) {
      await updateDoc(doc(getPayrollRef(), payrollData.id), data);
      return payrollData.id;
    } else {
      const docRef = await addDoc(getPayrollRef(), data);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving payroll:', error);
    throw error;
  }
}

/**
 * Delete a payroll record
 * @param {string} payrollId
 */
export async function deletePayrollRecord(payrollId) {
  requireCompany();
  try {
    await deleteDoc(doc(getPayrollRef(), payrollId));
    return true;
  } catch (error) {
    console.error('Error deleting payroll:', error);
    throw error;
  }
}

/**
 * Get payroll by ID
 * @param {string} payrollId
 * @returns {Promise<Object|null>}
 */
export async function getPayrollById(payrollId) {
  requireCompany();
  try {
    const snap = await getDoc(doc(getPayrollRef(), payrollId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting payroll:', error);
    return null;
  }
}

/**
 * Get total gross pay for all payroll records
 * @returns {Promise<number>}
 */
export async function getTotalGrossPay() {
  requireCompany();
  try {
    const snap = await getDocs(getPayrollRef());
    return snap.docs.reduce((sum, d) => sum + (d.data().grossPay || 0), 0);
  } catch (error) {
    console.error('Error calculating total gross:', error);
    return 0;
  }
}

/**
 * Get payroll summary for a period
 * @param {string} month
 * @param {number} year
 * @returns {Promise<{count: number, totalGross: number, totalNet: number, totalDeductions: number}>}
 */
export async function getPayrollSummary(month, year) {
  requireCompany();
  try {
    const q = query(getPayrollRef(), where('month', '==', month), where('year', '==', year));
    const snap = await getDocs(q);
    const records = snap.docs.map(d => d.data());
    return {
      count: records.length,
      totalGross: records.reduce((s, r) => s + (r.grossPay || 0), 0),
      totalNet: records.reduce((s, r) => s + (r.netPay || 0), 0),
      totalDeductions: records.reduce((s, r) => s + (r.totalBfTax || 0) + (r.paye || 0) + (r.totalAfTax || 0), 0)
    };
  } catch (error) {
    console.error('Error getting payroll summary:', error);
    return { count: 0, totalGross: 0, totalNet: 0, totalDeductions: 0 };
  }
}

/**
 * Get recent payroll records
 * @param {number} count
 * @returns {Promise<Array>}
 */
export async function getRecentPayroll(count = 10) {
  requireCompany();
  try {
    const q = query(getPayrollRef(), orderBy('createdAt', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting recent payroll:', error);
    return [];
  }
}

/**
 * Get payroll count for current company
 * @returns {Promise<number>}
 */
export async function getPayrollCount() {
  requireCompany();
  try {
    const snap = await getDocs(getPayrollRef());
    return snap.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Create a draft payroll record
 * @param {Object} data
 * @returns {Promise<string>}
 */
export async function createDraftPayroll(data) {
  requireCompany();
  try {
    const draft = {
      ...data,
      companyId: currentCompanyId,
      status: 'draft',
      approvedBy: null,
      approvedAt: null,
      locked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(getPayrollRef(), draft);
    return docRef.id;
  } catch (error) {
    console.error('Error creating draft payroll:', error);
    throw error;
  }
}

/**
 * Approve a payroll record
 * @param {string} payrollId
 * @param {string} approvedBy
 */
export async function approvePayroll(payrollId, approvedBy) {
  requireCompany();
  try {
    await updateDoc(doc(getPayrollRef(), payrollId), {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error approving payroll:', error);
    throw error;
  }
}

/**
 * Lock a payroll record (prevents further edits)
 * @param {string} payrollId
 */
export async function lockPayroll(payrollId) {
  requireCompany();
  try {
    await updateDoc(doc(getPayrollRef(), payrollId), {
      locked: true,
      status: 'locked',
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error locking payroll:', error);
    throw error;
  }
}