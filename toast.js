/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Toast Notification System
 * ============================================================
 * Premium toast notifications with animations and types.
 */

const TOAST_ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
  loading: '⏳'
};

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {'success'|'error'|'info'|'warning'|'loading'} type - Toast type
 * @param {number} duration - Auto-dismiss duration in ms (0 = manual dismiss)
 */
export function toast(message, type = 'success', duration = 3200) {
  const zone = document.getElementById('toastZone');
  if (!zone) {
    console.warn('Toast zone not found, creating one');
    const newZone = document.createElement('div');
    newZone.id = 'toastZone';
    document.body.appendChild(newZone);
  }
  
  const zoneEl = document.getElementById('toastZone');
  const el = document.createElement('div');
  const icon = TOAST_ICONS[type] || 'ℹ️';
  
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  zoneEl.appendChild(el);
  
  if (duration > 0) {
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(80px)';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }
  
  return el; // Return for manual dismissal
}

/**
 * Dismiss a specific toast
 * @param {HTMLElement} toastEl 
 */
export function dismissToast(toastEl) {
  if (toastEl) {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(80px)';
    setTimeout(() => toastEl.remove(), 300);
  }
}

/**
 * Show a confirmation dialog
 * @param {string} message 
 * @param {string} title 
 * @returns {Promise<boolean>}
 */
export function confirmDialog(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const result = window.confirm(`${title}\n\n${message}`);
    resolve(result);
  });
}