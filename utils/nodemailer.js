// emailService.js
const axios = require('axios');

const EMAIL_SERVER_URL = process.env.EMAIL_SERVER_URL || 'https://mailserver-production-f89c.up.railway.app';
const API_KEY = process.env.MAIL_API_KEY;

const sendVerificationEmail = async (email, token) => {
  try {
    const response = await axios.post(
      `${EMAIL_SERVER_URL}/api/send-verification`,
      { email, token },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      }
    );
    console.log('Verification email sent successfully');
    return response.data;
  } catch (error) {
    console.error('Error sending verification email:', error.response?.data || error.message);
    throw error;
  }
};

const sendResetPasswordEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      `${EMAIL_SERVER_URL}/api/send-reset-password`,
      { email, otp },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      }
    );
    console.log('Reset password email sent successfully');
    return response.data;
  } catch (error) {
    console.error('Error sending reset password email:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };