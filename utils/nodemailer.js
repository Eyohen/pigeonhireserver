const nodemailer = require('nodemailer');
console.log(process.env.EMAIL_PASS)
// Create a Nodemailer transporter using SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465, // SMTP port for secure connections
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send verification email
const sendVerificationEmail = (email, token) => {
    const mailOptions = {
        from: `"Pigeon Hire" <${process.env.EMAIL_USER}>`, // Sender address
        to: email, // List of recipients
        subject: 'Verify your email address', // Subject line
        html: `<p>Please verify your email address by clicking the link below:</p>
               <a href="${process.env.FRONTEND_URL}/verify?token=${token}">Verify Email</a>` // HTML body
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = { sendVerificationEmail };
