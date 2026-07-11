/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Subscription Service
 * ============================================================
 * Handles subscription plans, billing, and plan enforcement.
 */

import { db } from '../config/firebase-init.js';
import { COLLECTIONS, SUBSCRIPTION_PLANS } from '../config/firebase-config.js';
import {
  collection, addDoc, updateDoc, doc,
  getDoc, getDocs, query, where, orderBy, onSnapshot, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Get subscription plan details by plan ID
 * @param {string} planId
 * @returns {Object|null}
 */
export function getPlanDetails(planId) {
  return Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId) || null;
}

/**
 * Get all available plans
 * @returns {Array}
 */
export function getAllPlans() {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Subscribe a company to a plan
 * @param {string} companyId
 * @param {string} planId
 * @param {'monthly'|'yearly'} billingCycle
 * @param {Object} paymentInfo
 * @returns {Promise<string>}
 */
export async function subscribeCompany(companyId, planId, billingCycle = 'monthly', paymentInfo = {}) {
  try {
    const plan = getPlanDetails(planId);
    if (!plan) throw new Error('Invalid plan ID');

    const now = new Date();
    const billingPeriod = billingCycle === 'yearly' ? 365 : 30;
    const nextBilling = new Date(now.getTime() + billingPeriod * 24 * 60 * 60 * 1000);

    const subscription = {
      companyId,
      planId,
      planName: plan.name,
      price: plan.price,
      billingCycle,
      status: 'active',
      startedAt: now.toISOString(),
      nextBillingAt: nextBilling.toISOString(),
      paymentMethod: paymentInfo.method || '',
      paymentReference: paymentInfo.reference || '',
      autoRenew: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const subRef = await addDoc(collection(db, COLLECTIONS.SUBSCRIPTIONS), subscription);

    // Update company subscription info
    await updateDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
      subscriptionId: planId,
      subscriptionStatus: 'active',
      subscriptionRef: subRef.id,
      updatedAt: now.toISOString()
    });

    return subRef.id;
  } catch (error) {
    console.error('Error subscribing company:', error);
    throw error;
  }
}

/**
 * Get subscription for a company
 * @param {string} companyId
 * @returns {Promise<Object|null>}
 */
export async function getCompanySubscription(companyId) {
  try {
    const q = query(
      collection(db, COLLECTIONS.SUBSCRIPTIONS),
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Listen to all subscriptions (for system owner)
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function listenToAllSubscriptions(callback) {
  const q = query(collection(db, COLLECTIONS.SUBSCRIPTIONS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const subs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(subs);
  });
}

/**
 * Check if company can add more employees based on plan limits
 * @param {Object} company
 * @param {number} currentEmployeeCount
 * @returns {{ allowed: boolean, max: number, message: string }}
 */
export function checkEmployeeLimit(company, currentEmployeeCount) {
  const plan = getPlanDetails(company.subscriptionId || 'starter');
  if (!plan) return { allowed: false, max: 0, message: 'No active plan' };
  
  if (currentEmployeeCount >= plan.maxEmployees) {
    return {
      allowed: false,
      max: plan.maxEmployees,
      message: `Your ${plan.name} plan allows a maximum of ${plan.maxEmployees} employees. Please upgrade to add more.`
    };
  }
  
  return {
    allowed: true,
    max: plan.maxEmployees,
    message: `${currentEmployeeCount} of ${plan.maxEmployees} employees used`
  };
}

/**
 * Cancel subscription
 * @param {string} subscriptionId
 */
export async function cancelSubscription(subscriptionId) {
  try {
    await updateDoc(doc(db, COLLECTIONS.SUBSCRIPTIONS, subscriptionId), {
      status: 'cancelled',
      autoRenew: false,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}