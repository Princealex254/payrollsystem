/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Firebase Configuration
 * ============================================================
 * Centralized Firebase config for multi-tenant payroll system.
 * All modules import from here to maintain a single source of truth.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCJCrnatvZHLCz0CNm21MHzmIIBFVix0Io",
  authDomain: "prince-alex-payroll.firebaseapp.com",
  projectId: "prince-alex-payroll",
  storageBucket: "prince-alex-payroll.firebasestorage.app",
  messagingSenderId: "344752223450",
  appId: "1:344752223450:web:4238c90da59e5ef938e1e3"
};

// Collection names as constants to avoid typos
const COLLECTIONS = {
  COMPANIES: 'companies',
  USERS: 'users',
  COMPANY_USERS: 'companyUsers',
  EMPLOYEES: 'employees',
  DEPARTMENTS: 'departments',
  BRANCHES: 'branches',
  PAYROLL: 'payroll',
  PAYSLIPS: 'payslips',
  ATTENDANCE: 'attendance',
  LEAVE_REQUESTS: 'leaveRequests',
  LOANS: 'loans',
  ASSETS: 'assets',
  SUBSCRIPTIONS: 'subscriptions',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
  MAIL: 'mail',
  SYSTEM_CONFIG: 'systemConfig'
};

// Subscription plans
const SUBSCRIPTION_PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    maxEmployees: 10,
    maxUsers: 2,
    maxBranches: 1,
    storageGB: 1,
    modules: ['payroll', 'payslips', 'basic-reports'],
    features: ['Basic Payroll', 'Payslip Generation', 'Statutory Reports', 'Email Support']
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 2999,
    maxEmployees: 50,
    maxUsers: 5,
    maxBranches: 3,
    storageGB: 5,
    modules: ['payroll', 'payslips', 'reports', 'leave', 'attendance', 'loans'],
    features: ['Everything in Starter', 'Leave Management', 'Attendance Tracking', 'Loan Management', 'Bulk Email', 'Priority Support']
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 5999,
    maxEmployees: 200,
    maxUsers: 15,
    maxBranches: 10,
    storageGB: 20,
    modules: ['all'],
    features: ['Everything in Professional', 'Assets Management', 'Recruitment', 'Advanced Reports', 'API Access', 'Dedicated Support']
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 14999,
    maxEmployees: 999999,
    maxUsers: 999,
    maxBranches: 999,
    storageGB: 100,
    modules: ['all'],
    features: ['Everything in Business', 'Unlimited Employees', 'Custom Integrations', 'SLA Guarantee', 'Account Manager', 'Training']
  }
};

// Role definitions
const ROLES = {
  SYSTEM_OWNER: 'system_owner',
  ADMIN: 'admin',
  HR: 'hr',
  FINANCE: 'finance',
  PAYROLL_OFFICER: 'payroll_officer',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

const ROLE_PERMISSIONS = {
  [ROLES.SYSTEM_OWNER]: {
    label: 'System Owner',
    level: 100,
    manageCompanies: true,
    manageSubscriptions: true,
    manageSystem: true,
    manageUsers: true,
    viewAnalytics: true,
    auditLogs: true
  },
  [ROLES.ADMIN]: {
    label: 'Administrator',
    level: 80,
    manageEmployees: true,
    managePayroll: true,
    manageSettings: true,
    manageUsers: true,
    manageDepartments: true,
    manageBranches: true,
    manageLeave: true,
    manageAttendance: true,
    manageLoans: true,
    manageAssets: true,
    manageRecruitment: true,
    viewReports: true,
    approvePayroll: true,
    approveLeave: true
  },
  [ROLES.HR]: {
    label: 'HR Manager',
    level: 60,
    manageEmployees: true,
    manageDepartments: true,
    manageLeave: true,
    manageAttendance: true,
    manageAssets: true,
    manageRecruitment: true,
    viewReports: true,
    approveLeave: true,
    manageSettings: false,
    managePayroll: false,
    manageUsers: false
  },
  [ROLES.FINANCE]: {
    label: 'Finance',
    level: 60,
    managePayroll: true,
    manageLoans: true,
    viewReports: true,
    approvePayroll: true,
    manageEmployees: false,
    manageSettings: false,
    manageUsers: false
  },
  [ROLES.PAYROLL_OFFICER]: {
    label: 'Payroll Officer',
    level: 50,
    managePayroll: true,
    manageEmployees: true,
    viewReports: true,
    approvePayroll: false,
    manageSettings: false,
    manageUsers: false
  },
  [ROLES.MANAGER]: {
    label: 'Manager',
    level: 40,
    manageEmployees: true,
    manageLeave: true,
    approveLeave: true,
    viewReports: true,
    managePayroll: false,
    manageSettings: false,
    manageUsers: false
  },
  [ROLES.EMPLOYEE]: {
    label: 'Employee',
    level: 10,
    viewProfile: true,
    viewPayslips: true,
    requestLeave: true,
    viewAttendance: true,
    viewTaxSummary: true,
    manageSettings: false,
    manageUsers: false,
    managePayroll: false
  }
};

// Export for use in modules
export {
  FIREBASE_CONFIG,
  COLLECTIONS,
  SUBSCRIPTION_PLANS,
  ROLES,
  ROLE_PERMISSIONS
};