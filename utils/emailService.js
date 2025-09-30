const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Create transporter
const createTransporter = () => {

  // Add verification
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }

  console.log('Email user configured:', process.env.EMAIL_USER);

  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 587,
    secure: false,
    requireTLS: true,
    // port: 465,  // Changed from 587
    // secure: true, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });
};

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
    const transporter = createTransporter();

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
        name: 'Pigeonhire',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Welcome to Pigeonhire Premium! 🎉',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Subscription success email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending subscription success email:', error);
    return { success: false, error: error.message };
  }
};

// Send subscription deactivated email
const sendSubscriptionDeactivatedEmail = async (userEmail, userDetails, subscriptionDetails) => {
  try {
    const transporter = createTransporter();

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
        name: 'Pigeonhire',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Your Pigeonhire Subscription Has Been Deactivated',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Subscription deactivated email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending subscription deactivated email:', error);
    return { success: false, error: error.message };
  }
};

// Send renewal reminder email
const sendRenewalReminderEmail = async (userEmail, userDetails, subscriptionDetails) => {
  try {
    const transporter = createTransporter();

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
        name: 'Pigeonhire',
        address: process.env.EMAIL_USER
      },
      to: userEmail,
      subject: 'Your Pigeonhire Subscription Expires in 5 Days ⏰',
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Renewal reminder email sent:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending renewal reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email server connection verified');
    return { success: true };
  } catch (error) {
    console.error('Email server connection failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSubscriptionSuccessEmail,
  sendSubscriptionDeactivatedEmail,
  sendRenewalReminderEmail,
  testEmailConnection
};