//utils/emailService.js
const sgMail = require('@sendgrid/mail');
const fs = require('fs').promises;
const path = require('path');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Load and process email template
const loadTemplate = async (templateName, variables = {}) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf8');

    // Replace template variables
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, variables[key] || '');
    });

    return template;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw new Error(`Template ${templateName} not found`);
  }
};

// Format date for email display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate next billing date based on plan type
const calculateNextBillingDate = (startDate, planType) => {
  const start = new Date(startDate);
  switch (planType) {
    case 'monthly':
      return new Date(start.setMonth(start.getMonth() + 1));
    case 'quarterly':
      return new Date(start.setMonth(start.getMonth() + 3));
    case 'annually':
      return new Date(start.setFullYear(start.getFullYear() + 1));
    default:
      return new Date(start.setMonth(start.getMonth() + 1));
  }
};

// Send subscription success email
const sendSubscriptionSuccessEmail = async (userEmail, userDetails, subscriptionDetails) => {
  try {
    const templateVariables = {
      userName: `${userDetails.firstName} ${userDetails.lastName}`,
      planType: subscriptionDetails.planType.charAt(0).toUpperCase() + subscriptionDetails.planType.slice(1),
      amount: subscriptionDetails.amount,
      currency: subscriptionDetails.currency,
      startDate: formatDate(subscriptionDetails.startDate),
      nextBillingDate: formatDate(calculateNextBillingDate(subscriptionDetails.startDate, subscriptionDetails.planType)),
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/subscription/manage`,
      privacyUrl: `${process.env.FRONTEND_URL}/privacy`,
      termsUrl: `${process.env.FRONTEND_URL}/terms`
    };

    const htmlContent = await loadTemplate('subscription-success', templateVariables);

    const mailOptions = {
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@coinley.io',
        name: 'Pigeonhire'
      },
      to: userEmail,
      subject: 'Welcome to Pigeonhire Premium! 🎉',
      html: htmlContent
    };

    const result = await sgMail.send(mailOptions);
    console.log('Subscription success email sent successfully');
    return { success: true, messageId: result[0].headers['x-message-id'] };

  } catch (error) {
    console.error('Error sending subscription success email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// Send subscription deactivated email
const sendSubscriptionDeactivatedEmail = async (userEmail, userDetails, subscriptionDetails) => {
  try {
    const templateVariables = {
      userName: `${userDetails.firstName} ${userDetails.lastName}`,
      planType: subscriptionDetails.planType.charAt(0).toUpperCase() + subscriptionDetails.planType.slice(1),
      deactivationDate: formatDate(new Date()),
      deactivationReason: subscriptionDetails.cancelReason || 'Cancelled by admin',
      lastPaymentAmount: subscriptionDetails.amount,
      currency: subscriptionDetails.currency,
      lastPaymentDate: formatDate(subscriptionDetails.lastPaymentDate || subscriptionDetails.startDate),
      reactivateUrl: `${process.env.FRONTEND_URL}/subscription/plans`,
      feedbackUrl: `${process.env.FRONTEND_URL}/feedback`,
      privacyUrl: `${process.env.FRONTEND_URL}/privacy`,
      termsUrl: `${process.env.FRONTEND_URL}/terms`
    };

    const htmlContent = await loadTemplate('subscription-deactivated', templateVariables);

    const mailOptions = {
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@coinley.io',
        name: 'Pigeonhire'
      },
      to: userEmail,
      subject: 'Your Pigeonhire Subscription Has Been Deactivated',
      html: htmlContent
    };

    const result = await sgMail.send(mailOptions);
    console.log('Subscription deactivated email sent successfully');
    return { success: true, messageId: result[0].headers['x-message-id'] };

  } catch (error) {
    console.error('Error sending subscription deactivated email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// Send renewal reminder email
const sendRenewalReminderEmail = async (userEmail, userDetails, subscriptionDetails) => {
  try {
    const templateVariables = {
      userName: `${userDetails.firstName} ${userDetails.lastName}`,
      planType: subscriptionDetails.planType.charAt(0).toUpperCase() + subscriptionDetails.planType.slice(1),
      currentPeriodStart: formatDate(subscriptionDetails.startDate),
      currentPeriodEnd: formatDate(subscriptionDetails.endDate),
      expirationDate: formatDate(subscriptionDetails.endDate),
      renewalAmount: subscriptionDetails.amount,
      currency: subscriptionDetails.currency,
      autoRenewEnabled: subscriptionDetails.autoRenew,
      renewUrl: `${process.env.FRONTEND_URL}/subscription/renew`,
      billingUrl: `${process.env.FRONTEND_URL}/subscription/billing`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/subscription/cancel`
    };

    const htmlContent = await loadTemplate('renewal-reminder', templateVariables);

    const mailOptions = {
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@coinley.io',
        name: 'Pigeonhire'
      },
      to: userEmail,
      subject: 'Your Pigeonhire Subscription Expires in 5 Days ⏰',
      html: htmlContent
    };

    const result = await sgMail.send(mailOptions);
    console.log('Renewal reminder email sent successfully');
    return { success: true, messageId: result[0].headers['x-message-id'] };

  } catch (error) {
    console.error('Error sending renewal reminder email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// Send team member invitation email
const sendTeamMemberInvitation = async (email, memberDetails, password) => {
  try {
    const mailOptions = {
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'info@coinley.io',
        name: 'Pigeonhire Admin'
      },
      to: email,
      subject: 'Welcome to Pigeonhire Admin Team! 🎉',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Member Invitation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eaeaea;
        }
        .header h1 {
            color: #F08E1F;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            margin-bottom: 35px;
        }
        .content p {
            font-size: 16px;
            margin-bottom: 15px;
            color: #555;
        }
        .credentials {
            background-color: #f8f8f8;
            padding: 20px;
            border-radius: 5px;
            margin: 25px 0;
        }
        .credentials p {
            margin: 10px 0;
            font-family: monospace;
            color: #333;
        }
        .credentials strong {
            color: #F08E1F;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #F08E1F;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 500;
            transition: background-color 0.2s ease;
            box-shadow: 0 2px 5px rgba(240, 142, 31, 0.3);
            margin-top: 15px;
        }
        .button:hover {
            background-color: #e07d10;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            font-size: 14px;
            color: #888;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
        .warning p {
            margin: 0;
            color: #856404;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to the Admin Team!</h1>
        </div>

        <div class="content">
            <p>Hello ${memberDetails.firstName} ${memberDetails.lastName},</p>

            <p>You have been added as an <strong>${memberDetails.role === 'superadmin' ? 'Super Admin' : 'Admin'}</strong> team member for Pigeonhire. You now have access to the admin dashboard with the following credentials:</p>

            <div class="credentials">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${password}</p>
                <p><strong>Role:</strong> ${memberDetails.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
            </div>

            <div class="warning">
                <p><strong>⚠️ Important:</strong> Please change your password immediately after your first login for security purposes.</p>
            </div>

            <p>Click the button below to access the admin login page:</p>

            <a href="${process.env.FRONTEND_URL}/admin/login" class="button">Login to Admin Dashboard</a>
        </div>

        <div class="footer">
            <p>If you have any questions or need assistance, please contact the super admin.</p>
            <p style="margin-top: 20px; font-size: 12px;">© 2025 Pigeonhire. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
    };

    const result = await sgMail.send(mailOptions);
    console.log('Team member invitation email sent successfully');
    return { success: true, messageId: result[0].headers['x-message-id'] };

  } catch (error) {
    console.error('Error sending team member invitation email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConnection = async () => {
  try {
    // SendGrid doesn't have a verify method like nodemailer
    // We can test by checking if the API key is set
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not set');
    }
    console.log('SendGrid email service configured');
    return { success: true };
  } catch (error) {
    console.error('Email service configuration failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSubscriptionSuccessEmail,
  sendSubscriptionDeactivatedEmail,
  sendRenewalReminderEmail,
  sendTeamMemberInvitation,
  testEmailConnection
};




