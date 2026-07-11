/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Audit Log Service
 * ============================================================
 * Tracks all user activities across the platform.
 */

import { db } from '../config/firebase-init.js';
import { COLLECTIONS } from '../config/firebase-config.js';
import {
  collection, addDoc, query, where, orderBy, limit, onSnapshot, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Log an audit event
 * @param {Object} params
 * @param {string} params.companyId
 * @param {string} params.userId
 * @param {string} params.userEmail
 * @param {string} params.userRole
 * @param {string} params.action - e.g., 'employee.created', 'payroll.approved'
 * @param {string} params.resource - e.g., 'employees', 'payroll'
 * @param {string} params.resourceId
 * @param {string} params.details - Human-readable description
 * @param {Object} params.metadata - Additional data
 */
export async function logAuditEvent(params) {
  try {
    const auditEntry = {
      companyId: params.companyId || 'system',
      userId: params.userId || 'unknown',
      userEmail: params.userEmail || 'unknown',
      userRole: params.userRole || 'unknown',
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId || '',
      details: params.details || '',
      metadata: params.metadata || {},
      ipAddress: params.ipAddress || '',
      userAgent: navigator.userAgent || '',
      timestamp: new Date().toISOString()
    };

    await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), auditEntry);
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

/**
 * Listen to audit logs for a company
 * @param {string} companyId
 * @param {number} logLimit
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function listenToAuditLogs(companyId, logLimit = 100, callback) {
  const q = query(
    collection(db, COLLECTIONS.AUDIT_LOGS),
    where('companyId', '==', companyId),
    orderBy('timestamp', 'desc'),
    limit(logLimit)
  );
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(logs);
  }, (error) => {
    console.error('Audit log listener error:', error);
  });
}

/**
 * Listen to all audit logs (system owner)
 * @param {number} logLimit
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function listenToAllAuditLogs(logLimit = 200, callback) {
  const q = query(
    collection(db, COLLECTIONS.AUDIT_LOGS),
    orderBy('timestamp', 'desc'),
    limit(logLimit)
  );
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(logs);
  });
}

/**
 * Get audit logs for a specific action
 * @param {string} action
 * @param {number} logLimit
 * @returns {Promise<Array>}
 */
export async function getAuditLogsByAction(action, logLimit = 50) {
  try {
    const q = query(
      collection(db, COLLECTIONS.AUDIT_LOGS),
      where('action', '==', action),
      orderBy('timestamp', 'desc'),
      limit(logLimit)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}