/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * User Service - Centralized user management
 * ============================================================
 * All users live in a top-level 'users' collection.
 * Role determines dashboard access after authentication.
 * 
 * Roles: owner, company_admin, hr, finance, payroll_officer, manager, employee
 */

import { db } from '../config/firebase-init.js';
import { COLLECTIONS, ROLES } from '../config/firebase-config.js';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDoc, getDocs, query, where, orderBy, limit, onSnapshot, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Create a new user record in Firestore
 * @param {Object} userData
 * @param {string} userData.uid - Firebase Auth UID
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.role
 * @param {string} userData.companyId - null for owner
 * @param {string} userData.phone
 * @returns {Promise<string>}
 */
export async function createUser(userData) {
  try {
    const userRecord = {
      uid: userData.uid,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || ROLES.ADMIN,
      companyId: userData.companyId || null,
      phone: userData.phone || '',
      status: 'active',
      photo: userData.photo || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, userData.uid), userRecord);
    return userData.uid;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get user by Firebase UID
 * @param {string} uid
 * @returns {Promise<Object|null>}
 */
export async function getUser(uid) {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Update user data
 * @param {string} uid
 * @param {Object} updates
 */
export async function updateUser(uid, updates) {
  try {
    updates.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), updates);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get all users for a company
 * @param {string} companyId
 * @returns {Promise<Array>}
 */
export async function getCompanyUsers(companyId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting company users:', error);
    return [];
  }
}

/**
 * Listen to users for a company
 * @param {string} companyId
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function listenToCompanyUsers(companyId, callback) {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(users);
  }, (error) => {
    console.error('Company users listener error:', error);
  });
}

/**
 * Check if email is already registered as a user
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function emailExists(email) {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

/**
 * Get user by role within a company
 * @param {string} companyId
 * @param {string} role
 * @returns {Promise<Array>}
 */
export async function getUsersByRole(companyId, role) {
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('companyId', '==', companyId),
      where('role', '==', role)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting users by role:', error);
    return [];
  }
}

/**
 * Delete a user
 * @param {string} uid
 */
export async function deleteUser(uid) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, uid));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}