/**
 * PRINCE ALEX DIGITAL PAYROLL SAAS
 * Email Service - Cloudflare Worker Integration
 * ============================================================
 * Sends emails via Cloudflare Worker at:
 * https://prince-alex-mail-worker.princealexdigital.workers.dev
 */

const EMAIL_WORKER_URL = 'https://payroll.princealexdigital.workers.dev';

/**
 * Send email via Cloudflare Worker
 * @param {Object} emailData
 * @param {string} emailData.toEmail - Recipient email (required)
 * @param {string} emailData.toName - Recipient name (optional)
 * @param {string} emailData.subject - Email subject (required)
 * @param {string} emailData.htmlContent - HTML body content (required)
 * @param {Array} [emailData.attachments] - Array of attachments (optional)
 * @returns {Promise<boolean>}
 */
export async function sendEmail(emailData) {
  try {
    // Build payload - only include attachments if they exist
    const payload = {
      toEmail: emailData.toEmail,
      toName: emailData.toName || 'User',
      subject: emailData.subject,
      htmlContent: emailData.htmlContent
    };

    // Only add attachments if present (Brevo API rejects empty arrays)
    if (emailData.attachments && emailData.attachments.length > 0) {
      payload.attachments = emailData.attachments;
    }

    const response = await fetch(`${EMAIL_WORKER_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email worker error:', error);
      return false;
    }

    const result = await response.json();
    if (result.success) {
      console.log('✅ Email dispatched successfully:', {
        to: emailData.toEmail,
        subject: emailData.subject,
        messageId: result.messageId || 'N/A',
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn('⚠️ Email dispatch returned unsuccessful:', result);
    }
    return result.success === true;
  } catch (error) {
    console.error('❌ Error sending email:', {
      error: error.message,
      to: emailData.toEmail,
      subject: emailData.subject,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

/**
 * Strip HTML tags for plain text fallback
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Send welcome email to new company
 * @param {Object} userData
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.companyName
 * @returns {Promise<boolean>}
 */
export async function sendWelcomeEmail(userData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Prince Alex Digital Payroll</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Prince Alex Digital</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Cloud Payroll & HR Management Platform</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #0F172A; font-size: 24px; font-weight: 700;">Welcome to Your Payroll Dashboard! 🎉</h2>
                  
                  <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hi ${userData.name},</p>
                  
                  <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    Welcome to <strong>Prince Alex Digital Payroll</strong>! Your company <strong>${userData.companyName}</strong> has been successfully registered.
                  </p>
                  
                  <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    You can now:
                  </p>
                  
                  <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                    <li>Add employees to your organization</li>
                    <li>Process payroll with automated calculations</li>
                    <li>Generate professional payslips</li>
                    <li>Download statutory reports (PAYE, NSSF, SHIF)</li>
                    <li>Manage leave and attendance</li>
                  </ul>
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="https://payrollsystem.princealex.digital/" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 24px 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    If you have any questions or need assistance, our support team is here to help.
                  </p>
                  
                  <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>
                    <strong>The Prince Alex Digital Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 24px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0 0 8px 0; color: #64748B; font-size: 13px;">
                    © 2025 Prince Alex Digital. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #64748B; font-size: 13px;">
                    <a href="mailto:info@princealex.digital" style="color: #4F46E5; text-decoration: none;">info@princealex.digital</a> · 
                    <a href="tel:+254717384875" style="color: #4F46E5; text-decoration: none;">+254 717 384 875</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    toEmail: userData.email,
    toName: userData.name,
    subject: 'Welcome to Prince Alex Digital Payroll! 🎉',
    htmlContent: html
  });
}

/**
 * Send password reset email
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.name
 * @param {string} data.resetLink
 * @returns {Promise<boolean>}
 */
export async function sendPasswordResetEmail(data) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Prince Alex Digital Payroll</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Prince Alex Digital</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Cloud Payroll & HR Management Platform</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #0F172A; font-size: 24px; font-weight: 700;">Reset Your Password 🔒</h2>
                  
                  <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hi ${data.name},</p>
                  
                  <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your password. Click the button below to create a new password:
                  </p>
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${data.resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 24px 0 16px 0; color: #64748B; font-size: 14px; line-height: 1.6;">
                    This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                  </p>
                  
                  <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>
                    <strong>The Prince Alex Digital Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 24px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0 0 8px 0; color: #64748B; font-size: 13px;">
                    © 2025 Prince Alex Digital. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #64748B; font-size: 13px;">
                    <a href="mailto:info@princealex.digital" style="color: #4F46E5; text-decoration: none;">info@princealex.digital</a> · 
                    <a href="tel:+254717384875" style="color: #4F46E5; text-decoration: none;">+254 717 384 875</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    toEmail: data.email,
    toName: data.name,
    subject: 'Reset Your Password - Prince Alex Digital Payroll',
    htmlContent: html
  });
}

/**
 * Send payslip email
 * @param {Object} data
 * @param {string} data.employeeEmail
 * @param {string} data.employeeName
 * @param {string} data.month
 * @param {number} data.year
 * @param {string} data.pdfBase64 - PDF as base64
 * @param {string} data.companyName
 * @returns {Promise<boolean>}
 */
export async function sendPayslipEmail(data) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payslip for ${data.month} ${data.year}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${data.companyName || 'Prince Alex Digital'}</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Payroll Management System</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">Dear ${data.employeeName},</p>
                  
                  <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    Please find attached your pay slip for the month of <strong>${data.month} ${data.year}</strong>.
                  </p>
                  
                  <div style="background-color: #F8FAFC; border-left: 4px solid #4F46E5; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                      <strong>Important:</strong> Use your ID No. as PDF document password.
                    </p>
                  </div>
                  
                  <p style="margin: 24px 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    Regards,<br>
                    <strong>HR Department</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 24px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0 0 8px 0; color: #64748B; font-size: 13px;">
                    © 2025 Prince Alex Digital. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #64748B; font-size: 13px;">
                    <a href="mailto:info@princealex.digital" style="color: #4F46E5; text-decoration: none;">info@princealex.digital</a> · 
                    <a href="tel:+254717384875" style="color: #4F46E5; text-decoration: none;">+254 717 384 875</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    toEmail: data.employeeEmail,
    toName: data.employeeName,
    subject: `Payslip for ${data.month} ${data.year} - ${data.companyName || 'Prince Alex Digital'}`,
    htmlContent: html,
    attachments: data.pdfBase64 ? [{
      content: data.pdfBase64,
      name: `Payslip_${data.employeeName.replace(/\s+/g, '_')}_${data.month}_${data.year}.pdf`,
      type: 'application/pdf'
    }] : []
  });
}

/**
 * Send notification email
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.name
 * @param {string} data.subject
 * @param {string} data.message
 * @param {string} [data.actionUrl]
 * @param {string} [data.actionText]
 * @returns {Promise<boolean>}
 */
export async function sendNotificationEmail(data) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Prince Alex Digital</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Cloud Payroll & HR Management Platform</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #0F172A; font-size: 24px; font-weight: 700;">${data.subject}</h2>
                  
                  <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hi ${data.name},</p>
                  
                  <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    ${data.message}
                  </p>
                  
                  ${data.actionUrl ? `
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${data.actionUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${data.actionText || 'View Details'}</a>
                      </td>
                    </tr>
                  </table>
                  ` : ''}
                  
                  <p style="margin: 24px 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>
                    <strong>The Prince Alex Digital Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 24px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0 0 8px 0; color: #64748B; font-size: 13px;">
                    © 2025 Prince Alex Digital. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #64748B; font-size: 13px;">
                    <a href="mailto:info@princealex.digital" style="color: #4F46E5; text-decoration: none;">info@princealex.digital</a> · 
                    <a href="tel:+254717384875" style="color: #4F46E5; text-decoration: none;">+254 717 384 875</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    toEmail: data.email,
    toName: data.name,
    subject: data.subject,
    htmlContent: html
  });
}

/**
 * Send trial expiration reminder
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.name
 * @param {string} data.companyName
 * @param {string} data.expiryDate
 * @param {number} data.daysLeft
 * @returns {Promise<boolean>}
 */
export async function sendTrialReminderEmail(data) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Trial is Ending Soon</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #F59E0B 0%, #FB923C 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Prince Alex Digital</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Cloud Payroll & HR Management Platform</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #0F172A; font-size: 24px; font-weight: 700;">Your Free Trial is Ending Soon ⏰</h2>
                  
                  <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">Hi ${data.name},</p>
                  
                  <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    Your free trial for <strong>${data.companyName}</strong> will expire in <strong>${data.daysLeft} days</strong> (on ${data.expiryDate}).
                  </p>
                  
                  <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
                      <strong>Don't lose access!</strong> Upgrade to a paid plan to continue using all features without interruption.
                    </p>
                  </div>
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="https://payrollsystem.princealex.digital/" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Upgrade Now</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 24px 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    If you have any questions, our team is happy to help.
                  </p>
                  
                  <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>
                    <strong>The Prince Alex Digital Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 24px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0 0 8px 0; color: #64748B; font-size: 13px;">
                    © 2025 Prince Alex Digital. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #64748B; font-size: 13px;">
                    <a href="mailto:info@princealex.digital" style="color: #4F46E5; text-decoration: none;">info@princealex.digital</a> · 
                    <a href="tel:+254717384875" style="color: #4F46E5; text-decoration: none;">+254 717 384 875</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    toEmail: data.email,
    toName: data.name,
    subject: `Your Free Trial Ends in ${data.daysLeft} Days`,
    htmlContent: html
  });
}

/**
 * Send user invitation email
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.name
 * @param {string} data.companyName
 * @param {string} data.role
 * @param {string} data.invitedBy
 * @param {string} [data.loginEmail]
 * @returns {Promise<boolean>}
 */
export async function sendUserInviteEmail(data) {
  const roleLabels = {
    admin: 'Administrator',
    hr: 'HR Manager',
    finance: 'Finance',
    payroll_officer: 'Payroll Officer',
    manager: 'Manager',
    employee: 'Employee'
  };
  const roleLabel = roleLabels[data.role] || data.role;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've been invited to ${data.companyName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f4f8;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);">
              <!-- Header with Branding -->
              <tr>
                <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A855F7 100%); padding: 48px 30px 36px; text-align: center;">
                  <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.15); border-radius: 18px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #fff; font-size: 32px; font-weight: 800; font-family: Arial, sans-serif;">PAD</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Prince Alex Digital</h1>
                  <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.85); font-size: 14px; letter-spacing: 0.3px;">Cloud Payroll & HR Management Platform</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <!-- Icon -->
                  <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #fff; font-size: 28px;">&#9993;</span>
                  </div>
                  
                  <!-- Heading -->
                  <h2 style="margin: 0 0 8px 0; color: #0F172A; font-size: 24px; font-weight: 700; text-align: center; letter-spacing: -0.3px;">You're Invited!</h2>
                  <p style="margin: 0 0 32px 0; color: #64748B; font-size: 15px; text-align: center;">Join your team on Prince Alex Digital Payroll</p>
                  
                  <!-- Greeting and Message -->
                  <div style="background: linear-gradient(135deg, #F8FAFC, #F1F5F9); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.7;">Hello <strong style="color: #0F172A;">${data.name}</strong>,</p>
                    
                    <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.7;">
                      <strong style="color: #0F172A;">${data.invitedBy}</strong> has invited you to join <strong style="color: #0F172A;">${data.companyName}</strong> on the Prince Alex Digital Payroll platform.
                    </p>
                    
                    <!-- Details Card -->
                    <div style="background: #ffffff; border-radius: 10px; padding: 16px 20px; margin: 20px 0; border: 1px solid #E2E8F0;">
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F1F5F9;">
                        <span style="color: #64748B; font-size: 13px; font-weight: 500;">Company</span>
                        <span style="color: #0F172A; font-weight: 600; font-size: 14px;">${data.companyName}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F1F5F9;">
                        <span style="color: #64748B; font-size: 13px; font-weight: 500;">Your Role</span>
                        <span style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">${roleLabel}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                        <span style="color: #64748B; font-size: 13px; font-weight: 500;">Invited by</span>
                        <span style="color: #0F172A; font-weight: 500; font-size: 14px;">${data.invitedBy}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Features Section -->
                  <div style="margin-bottom: 24px;">
                    <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.7;">
                      As a <strong>${roleLabel}</strong>, you will have access to the following features:
                    </p>
                    
                    <ul style="margin: 0; padding-left: 24px; color: #475569; font-size: 14px; line-height: 2;">
                      <li style="margin-bottom: 6px;">View and manage employee records</li>
                      <li style="margin-bottom: 6px;">Process payroll and generate payslips</li>
                      <li style="margin-bottom: 6px;">Access statutory reports and tax summaries</li>
                      <li style="margin-bottom: 6px;">Collaborate with your team in real-time</li>
                    </ul>
                  </div>
                  
                  <!-- Getting Started Section -->
                  <div style="background: linear-gradient(135deg, #EEF2FF, #E0E7FF); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #C7D2FE;">
                    <h3 style="margin: 0 0 20px 0; color: #3730A3; font-size: 16px; font-weight: 700; text-align: center;">Getting Started</h3>
                    
                    <div style="background: #ffffff; border-radius: 8px; padding: 16px; border: 1px solid #C7D2FE;">
                      <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #EEF2FF;">
                        <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 12px; flex-shrink: 0; margin-top: 2px;">1</div>
                        <span style="color: #0F172A; font-size: 14px; font-weight: 500; line-height: 1.5; padding-top: 4px;">Go to the login page</span>
                      </div>
                      <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #EEF2FF;">
                        <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 12px; flex-shrink: 0; margin-top: 2px;">2</div>
                        <span style="color: #0F172A; font-size: 14px; font-weight: 500; line-height: 1.5; padding-top: 4px;">Click <strong>"Forgot Password?"</strong></span>
                      </div>
                      <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 0;">
                        <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 12px; flex-shrink: 0; margin-top: 2px;">3</div>
                        <span style="color: #0F172A; font-size: 14px; font-weight: 500; line-height: 1.5; padding-top: 4px;">Enter your email to set your password</span>
                      </div>
                    </div>
                    
                    <div style="margin-top: 16px; padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px dashed #C7D2FE;">
                      <p style="margin: 0; color: #3730A3; font-size: 13px; text-align: center; line-height: 1.6;">
                        Use this email address: <strong style="font-size: 14px;">${data.loginEmail || data.email}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <!-- CTA Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="https://payrollsystem.princealex.digital/" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(79,70,229,0.3);">Go to Dashboard</a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Footer Note -->
                  <div style="margin-top: 24px; padding: 16px; background-color: #F8FAFC; border-radius: 8px; border-left: 3px solid #E2E8F0;">
                    <p style="margin: 0; color: #64748B; font-size: 13px; line-height: 1.6; text-align: center;">
                      This invitation was sent on behalf of <strong>${data.companyName}</strong>.<br>
                      If you have any questions, please contact your administrator.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; padding: 24px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
                  <p style="margin: 0 0 8px 0; color: #64748B; font-size: 12px;">
                    © 2025 Prince Alex Digital. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #64748B; font-size: 12px;">
                    <a href="mailto:info@princealex.digital" style="color: #4F46E5; text-decoration: none;">info@princealex.digital</a> &middot; 
                    <a href="tel:+254717384875" style="color: #4F46E5; text-decoration: none;">+254 717 384 875</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const subject = `You've been invited to ${data.companyName} on Prince Alex Digital Payroll`;

  return sendEmail({
    toEmail: data.email,
    toName: data.name,
    subject: subject,
    htmlContent: html
  });
}
