//utils/nodemailer.js
const nodemailer = require("nodemailer");
console.log(process.env.EMAIL_PASS);
// Create a Nodemailer transporter using SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
       port: 587,
       secure: false,
    // port: 465,  // Changed from 587
    // secure: true,

    //secure: true, // true for 465, false for other ports

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: true
    }
});

// Function to send verification email
const sendVerificationEmail = (email, token) => {
    const mailOptions = {
        from: `"Pigeonhire Support" <${process.env.EMAIL_USER}>`, // Sender address
        to: email, // List of recipients
        subject: "Verify your email address", // Subject line
        // html: `<p>Please verify your email address by clicking the link below:</p>
        //        <a href="${process.env.FRONTEND_URL}/verify?token=${token}">Verify Email</a>`
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
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
        .logo {
            margin-bottom: 20px;
        }
        .logo img {
            height: 50px;
        }
        .content {
            text-align: center;
            margin-bottom: 35px;
        }
        .content p {
            font-size: 16px;
            margin-bottom: 25px;
            color: #555;
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
        .help-text {
            margin-top: 25px;
            font-size: 14px;
            color: #777;
            text-align: center;
        }
        .social-links {
            margin-top: 20px;
            text-align: center;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #555;
            text-decoration: none;
        }
        .verification-code {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 18px;
            letter-spacing: 2px;
            margin: 25px 0;
            color: #333;
        }
        @media only screen and (max-width: 480px) {
            .container {
                padding: 25px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- Optional: Add your logo here -->
            <div class="logo">
                <img src="/api/placeholder/150/50" alt="Your Logo">
            </div>
            <h1>Verify Your Email Address</h1>
        </div>
        
        <div class="content">
            <p>Thank you for signing up! To complete your registration and access your account, please verify your email address by clicking the button below:</p>
            
            <a href="${process.env.FRONTEND_URL}/verify?token=${token}" class="button">Verify My Email</a>
            
            <div class="help-text">
                <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
                <p style="font-size: 12px; color: #999;">${process.env.FRONTEND_URL}/verify?token=${token}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>If you did not create an account with us, please disregard this email.</p>
            <p>Need help? Contact our support team at <a href="mailto:support@yourcompany.com" style="color: #F08E1F; text-decoration: none;">support@yourcompany.com</a></p>
            
            
            <p style="margin-top: 20px; font-size: 12px;">© 2025 Your Company. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

// Function to send reset Password email
const sendResetPasswordEmail = async (email, otp, resetToken) => {
    const mailOptions = {
        from: `"Pigeonhire Support" <${process.env.EMAIL_USER}>`, // Sender address
        to: email, // List of recipients
        subject: "Password Reset OTP", // Subject line
        // html: `<p>Your OTP for password reset is:${otp}. This otp will expire in 10 minutes. Your reset token is ${resetToken}</p>`
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #fff;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #F08E1F;
        }
        .content {
            text-align: center;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .otp {
            display: inline-block;
            padding: 10px 20px;
            background-color: #F08E1F;
            color: #fff;
            font-size: 20px;
            font-weight: bold;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset OTP</h1>
        </div>
        <div class="content">
            <p>Your OTP for password reset is:</p>
            <div class="otp">${otp}</div>
            <p>This otp will expire in 10 minutes.</p>
        </div>
        <div class="footer">
            <p>If you did not request a password reset, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
