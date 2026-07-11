/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Company Service - Multi-tenant company management
 * ============================================================
 * Handles all company CRUD operations with tenant isolation.
 * Every document in Firestore is scoped by companyId.
 */

import { db } from '../config/firebase-init.js';
import { COLLECTIONS } from '../config/firebase-config.js';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  getDoc, getDocs, query, where, orderBy, onSnapshot, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { toast } from '../utils/toast.js';

/**
 * Create a new company in the system
 * @param {Object} companyData - Company details
 * @param {string} companyData.name - Company name
 * @param {string} companyData.email - Company email
 * @param {string} companyData.phone - Company phone
 * @param {string} companyData.ownerId - Firebase UID of the owner
 * @param {string} companyData.ownerEmail - Email of the owner
 * @returns {Promise<string>} The new company ID
 */
export async function createCompany(companyData) {
  try {
    const now = new Date().toISOString();
    const company = {
      name: companyData.name,
      email: companyData.email || '',
      phone: companyData.phone || '',
      address: companyData.address || '',
      website: companyData.website || '',
      kraPin: companyData.kraPin || '',
      nssfNumber: companyData.nssfNumber || '',
      shifNumber: companyData.shifNumber || '',
      housingLevyNumber: companyData.housingLevyNumber || '',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      logo: companyData.logo || '',
      primaryColor: '#6366F1',
      secondaryColor: '#F59E0B',
      ownerId: companyData.ownerId,
      ownerEmail: companyData.ownerEmail,
      status: 'active',
      subscriptionId: 'starter',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day trial
      employeeCount: 0,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.COMPANIES), company);
    
    // Create default settings for the company
    await setDoc(doc(db, COLLECTIONS.SETTINGS, docRef.id), {
      companyId: docRef.id,
      payslipFooter: 'Powered by Prince Alex Digital',
      emailTemplate: 'default',
      theme: 'light',
      payrollApprovalRequired: true,
      autoGeneratePayslips: true,
      createdAt: now,
      updatedAt: now
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
}

/**
 * Get a company by ID
 * @param {string} companyId 
 * @returns {Promise<Object|null>}
 */
export async function getCompany(companyId) {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.COMPANIES, companyId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting company:', error);
    return null;
  }
}

/**
 * Update a company
 * @param {string} companyId 
 * @param {Object} updates 
 */
export async function updateCompany(companyId, updates) {
  try {
    updates.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, COLLECTIONS.COMPANIES, companyId), updates);
    return true;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
}

/**
 * Delete a company and all its data
 * @param {string} companyId 
 */
export async function deleteCompany(companyId) {
  try {
    // Delete company document
    await deleteDoc(doc(db, COLLECTIONS.COMPANIES, companyId));
    // Delete settings
    await deleteDoc(doc(db, COLLECTIONS.SETTINGS, companyId));
    return true;
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
}

/**
 * Listen to all companies (for system owner)
 * @param {Function} callback - Called with array of companies
 * @returns {Function} Unsubscribe function
 */
export function listenToAllCompanies(callback) {
  const q = query(collection(db, COLLECTIONS.COMPANIES), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const companies = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(companies);
  }, (error) => {
    console.error('Companies listener error:', error);
    toast('Failed to load companies', 'error');
  });
}

/**
 * Listen to a single company
 * @param {string} companyId 
 * @param {Function} callback 
 * @returns {Function} Unsubscribe function
 */
export function listenToCompany(companyId, callback) {
  return onSnapshot(doc(db, COLLECTIONS.COMPANIES, companyId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  }, (error) => {
    console.error('Company listener error:', error);
  });
}

/**
 * Get company settings
 * @param {string} companyId 
 * @returns {Promise<Object|null>}
 */
export async function getCompanySettings(companyId) {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, companyId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting company settings:', error);
    return null;
  }
}

/**
 * Update company settings
 * @param {string} companyId 
 * @param {Object} updates 
 */
export async function updateCompanySettings(companyId, updates) {
  try {
    updates.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, COLLECTIONS.SETTINGS, companyId), updates);
    return true;
  } catch (error) {
    console.error('Error updating company settings:', error);
    throw error;
  }
}

/**
 * Get total company count
 * @returns {Promise<number>}
 */
export async function getCompanyCount() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.COMPANIES));
    return snap.size;
  } catch (error) {
    console.error('Error counting companies:', error);
    return 0;
  }
}

/**
 * Get companies by status
 * @param {string} status - 'active', 'trial', 'expired', 'suspended'
 * @returns {Promise<Array>}
 */
export async function getCompaniesByStatus(status) {
  try {
    const q = query(collection(db, COLLECTIONS.COMPANIES), where('status', '==', status));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting companies by status:', error);
    return [];
  }
}