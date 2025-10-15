//controller/user.js
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { User, Review, Subscription, Currency } = db;
const { sendVerificationEmail } = require("../utils/nodemailer");
const crypto = require("crypto");
const { sendResetPasswordEmail } = require("../utils/nodemailer");
const { totalmem } = require("os");
const { Op } = require("sequelize");
const { permission } = require("process");
const { subscribe } = require("diagnostics_channel");
const { error } = require("console");
const {
  sendSubscriptionSuccessEmail,
  sendSubscriptionDeactivatedEmail,
  sendTeamMemberInvitation
} = require('../utils/emailService');


const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log("Received data:", req.body);

    // Check if user with the given email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create verification token
    const verificationToken = await uuidv4();

    // Create the user record with hashed password
    const record = await User.create({
      ...req.body,
      email,
      password: hashedPassword,
      verificationToken,
    }).catch((err) => {
      console.log("Database error:", err);
      throw err;
    });

    //send verification email
    sendVerificationEmail(email, verificationToken);

    return res.status(200).json({ record, msg: "User successfully created" });
  } catch (error) {
    console.log("Registration error", error);
    return res.status(500).json({ msg: "Failed to register user", error });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    console.log("toeiehe", token);

    //find the user with the provided token
    const user = await User.findOne({ where: { verificationToken: token } });
    console.log({ user });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // verify the user
    await user.update({ verified: true, verificationToken: null });
    // user.verified = true;
    // user.verificationToken = null;
    await user.save();

    return res.status(200).json({ msg: "Email successfully verified" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({ msg: "Failed to verify email", error });
  }
};

// creating users from the dashboard
const create = async (req, res) => {
  try {
    // create menu record in the database
    const record = await User.create({ ...req.body });
    return res
      .status(200)
      .json({ record, msg: "Successfully created Community Owner" });
  } catch (error) {
    console.log("henry", error);
    return res.status(500).json({ msg: "fail to create", error });
  }
};

const login = async (req, res) => {
  try {
    const { firstName, lastName, email, password, subscribed } = req.body;

    // Check if user with the given email exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // check if users email is verified
    if (!user.verified) {
      return res
        .status(401)
        .json({ msg: "Please verify your email to log in" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      fname: user.firstName,
      lname: user.lastName,
      role: user.role,
      currency: user.currency,
      subscribed: user.subscribed,
    };

    // Generate JWT token with user object
    const accessToken = jwt.sign(
      { user: userPayload },
      process.env.JWT_SECRET, // Use a secure secret key, preferably from environment variables
      { expiresIn: "14d" } // Token expiration time
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { user: userPayload },
      process.env.JWT_REFRESH_SECRET, // Use a secure refresh secret key
      { expiresIn: "14d" } // Refresh token expiration time
    );

    return res
      .status(200)
      .json({ accessToken, refreshToken, user: userPayload });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ msg: "Failed to log in", error });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user with the given email exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if user's role is admin or superadmin
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res
        .status(401)
        .json({ msg: "Unauthorized access: Only admins are allowed" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      fname: user.firstName,
      lname: user.lastName,
      role: user.role,
      currency: user.currency,
    };

    // Generate JWT token
    const accessToken = jwt.sign(
      { user: userPayload },
      // { userId: user.id, email: user.email },
      process.env.JWT_SECRET, // Use a secure secret key, preferably from environment variables
      { expiresIn: "14d" } // Token expiration time
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { user: userPayload },
      process.env.JWT_REFRESH_SECRET, // Use a secure refresh secret key
      { expiresIn: "14d" } // Refresh token expiration time
    );

    return res
      .status(200)
      .json({ accessToken, refreshToken, user: userPayload });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ msg: "Failed to log in", error });
  }
};

const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user with the given email exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if user's role is admin or superadmin
    if (user.role !== "superadmin") {
      return res
        .status(401)
        .json({ msg: "Unauthorized access: Only superadmins are allowed" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      fname: user.firstName,
      lname: user.lastName,
      role: user.role,
    };

    // Generate JWT token
    const accessToken = jwt.sign(
      { user: userPayload },
      // { userId: user.id, email: user.email },
      process.env.JWT_SECRET, // Use a secure secret key, preferably from environment variables
      { expiresIn: "14d" } // Token expiration time
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { user: userPayload },
      process.env.JWT_REFRESH_SECRET, // Use a secure refresh secret key
      { expiresIn: "14d" } // Refresh token expiration time
    );

    return res
      .status(200)
      .json({ accessToken, refreshToken, user: userPayload });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ msg: "Failed to log in", error });
  }
};

const refresh = async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized - Missing token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ ...decoded, access_token: token });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // check if user with the given email exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // generate a 4-digit otp
    const otp = crypto.randomInt(1000, 9999).toString().padStart(4, "0");

    // generate a unique token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //save the OTP, token  and its expiration time in the user record
    user.resetPasswordOTP = otp;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // otp expires in 10 minutes
    await user.save();

    // send email with OTP
    await sendResetPasswordEmail(email, otp, resetToken);

    return res
      .status(200)
      .json({ msg: "Password reset OTP sent to your email", resetToken });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return res
      .status(500)
      .json({ msg: "Failed to process forgot password request", error });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const resetToken = req.headers["x-reset-token"]; //  get the reset token from headers

    if (!otp) {
      return res.status(400).json({ msg: "OTP is required" });
    }

    if (!resetToken) {
      return res.status(400).json({ msg: "Reset token is required" });
    }

    // find user by reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: { [Op.gt]: Date.now() }, // check if token is expired
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "Invalid or expired reset token" });
    }

    //check if OTP is valid
    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    //OTP is valid
    return res.status(200).json({ msg: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    return res.status(500).json({ msg: "Failed to verify OTP", error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const resetToken = req.headers["x-reset-token"];

    if (!resetToken) {
      return res.status(400).json({ msg: "Reset token is required" });
    }

    // find user by reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: { [Op.gt]: Date.now() }, //check if token is not expired
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "Invalid reset token" });
    }

    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset password:", error);
    return res.status(500).json({ msg: "Failed to reset password", error });
  }
};

const profile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const readall = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const whereClause = search ? {
            [Op.or]: [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ]
        } : {};

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Subscription,
                    as: 'subscriptions',
                    where: { status: 'active' },
                    required: false, // This makes it a LEFT JOIN
                    order: [['createdAt', 'DESC']],
                    limit: 1
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password', 'resetPasswordOTP', 'resetPasswordToken'] }
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            users,
            totalCount: count,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            message: 'Failed to fetch users',
            error: error.message 
        });
    }
};



const readId = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await User.findOne({
      where: { id },
      include: [
        {
          model: Review,
          attributes: ["id", "rating", "comment", "createdAt", "reviewerId"],
          include: [
            {
              model: User,
              as: "Reviewer",
              attributes: ["firstName", "lastName"],
            },
          ],
        },
      ],
    });
    return res.json(record);
  } catch (e) {
    return res.json({ msg: "Failed to read", status: 500, route: "/read/:id" });
  }
};

const countUsers = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const count = await User.count({
      where: {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
    });

    return res.json({
      count: count,
      status: 200,
    });
  } catch (e) {
    console.error("Error counting communities:", e);
    return res.status(500).json({
      msg: "Failed to count communities",
      status: 500,
      route: "/count",
    });
  }
};

const update = async (req, res) => {
  try {
    const updated = await User.update(
      { ...req.body },
      { where: { id: req.params.id } }
    );
    if (updated) {
      const updatedUser = await User.findByPk(req.params.id);
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating the User", error });
  }
};

const deleteId = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await User.findOne({ where: { id } });

    if (!record) {
      return res.json({ msg: "Cannot find existing record" });
    }

    const deletedRecord = await record.destroy();
    return res.json({ record: deletedRecord });
  } catch (e) {
    return res.json({
      msg: "Failed to read",
      status: 500,
      route: "/delete/:id",
    });
  }
};

const readSubscribedUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Find the user to check their subscription status
    const currentUser = await User.findByPk(userId);

    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    let users;
    let count;

    if (currentUser.subscribed) {
      // If user is subscribed, return all users
      const result = await User.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Review,
            attributes: ["id", "rating", "comment", "createdAt", "reviewerId"],
            include: [
              {
                model: User,
                as: "Reviewer",
                attributes: ["firstName", "lastName"],
              },
            ],
          },
        ],
      });

      users = result.rows;
      count = result.count;
    } else {
      // If user is not subscribed, return only 3 users
      const result = await User.findAndCountAll({
        limit: 10,
        include: [
          {
            model: Review,
            attributes: ["id", "rating", "comment", "createdAt", "reviewerId"],
            include: [
              {
                model: User,
                as: "Reviewer",
                attributes: ["firstName", "lastName"],
              },
            ],
          },
        ],
      });

      users = result.rows;
      count = result.count;
    }

    return res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (e) {
    console.error("Error fetching users:", e);
    return res.status(500).json({
      msg: "Failed to fetch users",
      status: 500,
    });
  }
};

// Enhanced user profile update
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      bio,
      location,
      website,
      linkedIn,
      twitter,
      instagram,
      currentPassword,
      newPassword,
    } = req.body;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare update object with only the fields that should be updated
    const updateData = {};

    // Basic profile fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (linkedIn !== undefined) updateData.linkedIn = linkedIn;
    if (twitter !== undefined) updateData.twitter = twitter;
    if (instagram !== undefined) updateData.instagram = instagram;

    // Handle email update (check for uniqueness)
    if (email !== undefined && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: id }, // Exclude current user
        },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
          field: "email",
        });
      }
      updateData.email = email;
    }

    // Handle password update
    if (currentPassword && newPassword) {
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          message: "Current password is incorrect",
          field: "currentPassword",
        });
      }

      // Validate new password strength (optional)
      if (newPassword.length < 6) {
        return res.status(400).json({
          message: "New password must be at least 6 characters long",
          field: "newPassword",
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedNewPassword;
    }

    // Update user
    const [updated] = await User.update(updateData, {
      where: { id },
    });

    if (updated) {
      // Fetch updated user (exclude password)
      const updatedUser = await User.findByPk(id, {
        attributes: {
          exclude: [
            "password",
            "resetPasswordOTP",
            "resetPasswordToken",
            "resetPasswordExpires",
          ],
        },
      });

      return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Get user profile (enhanced with more details)
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "password",
          "resetPasswordOTP",
          "resetPasswordToken",
          "resetPasswordExpires",
        ],
      },
      include: [
        {
          model: Review,
          attributes: ["id", "rating", "comment", "createdAt", "reviewerId"],
          include: [
            {
              model: User,
              as: "Reviewer",
              attributes: ["firstName", "lastName"],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

// Upload profile image (if you want to add this functionality)
const uploadProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body; // Assuming you're using cloudinary

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const [updated] = await User.update(
      { profileImage: imageUrl },
      { where: { id } }
    );

    if (updated) {
      const updatedUser = await User.findByPk(id, {
        attributes: {
          exclude: [
            "password",
            "resetPasswordOTP",
            "resetPasswordToken",
            "resetPasswordExpires",
          ],
        },
      });

      return res.status(200).json({
        message: "Profile image updated successfully",
        user: updatedUser,
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return res.status(500).json({
      message: "Error uploading profile image",
      error: error.message,
    });
  }
};

// Change password only
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
        field: "confirmPassword",
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
        field: "newPassword",
      });
    }

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
        field: "currentPassword",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.update({ password: hashedNewPassword }, { where: { id } });

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      message: "Error changing password",
      error: error.message,
    });
  }
};


// Updated manualSubscribe function
const manualSubscribe = async (req, res) => {
    try {
        const { id } = req.params;
        const { planType = 'monthly', currencyCode = 'USD' } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get currency by code
        const currency = await Currency.findOne({
            where: { currency: currencyCode }
        });

        if (!currency) {
            return res.status(400).json({ 
                message: `Currency ${currencyCode} not found` 
            });
        }

        // Get amount based on plan type
        const amount = currency[planType] || 0;

        await user.update({ subscribed: true });

        const subscription = await Subscription.create({
            userId: id,
            currencyId: currency.id,
            planType,
            status: 'active',
            amount,
            currency: currencyCode,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            paymentMethod: 'manual',
            autoRenew: false,
            lastPaymentDate: new Date(),
            metadata: {
                type: 'manual',
                createdBy: 'admin'
            }
        });

        // Send subscription success email
        try {
            const emailResult = await sendSubscriptionSuccessEmail(
                user.email,
                {
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                {
                    planType: subscription.planType,
                    amount: subscription.amount,
                    currency: subscription.currency,
                    startDate: subscription.startDate
                }
            );
            
            console.log('Subscription email sent:', emailResult.success);
        } catch (emailError) {
            console.error('Failed to send subscription email:', emailError);
            // Don't fail the subscription creation if email fails
        }

        res.status(200).json({
            message: 'User manually subscribed successfully',
            user: { id: user.id, subscribed: user.subscribed },
            subscription,
            emailSent: true
        });

    } catch (error) {
        console.error('Manual subscribe error:', error);
        res.status(500).json({ 
            message: 'Failed to subscribe user',
            error: error.message 
        });
    }
};

// Updated manualUnsubscribe function
const manualUnsubscribe = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the user's active subscription for email details
        const activeSubscription = await Subscription.findOne({
            where: { 
                userId: id, 
                status: 'active' 
            },
            include: [
                {
                    model: Currency,
                    as: 'currencyDetails'
                }
            ]
        });

        // Update user subscribed field
        await user.update({ subscribed: false });

        // Cancel any active subscriptions
        await Subscription.update(
            { 
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelReason: 'Manually cancelled by admin'
            },
            { 
                where: { 
                    userId: id, 
                    status: 'active' 
                } 
            }
        );

        // Send deactivation email if there was an active subscription
        if (activeSubscription) {
            try {
                const emailResult = await sendSubscriptionDeactivatedEmail(
                    user.email,
                    {
                        firstName: user.firstName,
                        lastName: user.lastName
                    },
                    {
                        planType: activeSubscription.planType,
                        amount: activeSubscription.amount,
                        currency: activeSubscription.currency,
                        cancelReason: 'Manually cancelled by admin',
                        lastPaymentDate: activeSubscription.lastPaymentDate || activeSubscription.startDate,
                        startDate: activeSubscription.startDate
                    }
                );
                
                console.log('Deactivation email sent:', emailResult.success);
            } catch (emailError) {
                console.error('Failed to send deactivation email:', emailError);
                // Don't fail the unsubscription if email fails
            }
        }

        res.status(200).json({
            message: 'User manually unsubscribed successfully',
            user: { id: user.id, subscribed: user.subscribed },
            emailSent: activeSubscription ? true : false
        });

    } catch (error) {
        console.error('Manual unsubscribe error:', error);
        res.status(500).json({ 
            message: 'Failed to unsubscribe user',
            error: error.message 
        });
    }
};



// Create team member (Admin/SuperAdmin only)
const createTeamMember = async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        msg: "All fields are required (firstName, lastName, email, role)"
      });
    }

    // Validate role
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(400).json({
        msg: "Role must be either 'admin' or 'superadmin'"
      });
    }

    // Check if requesting user is admin or superadmin
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({
        msg: "Unauthorized: Only admins can create team members"
      });
    }

    // Only superadmin can create another superadmin
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        msg: "Unauthorized: Only superadmins can create other superadmins"
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // Generate temporary password (8 characters: letters + numbers)
    const tempPassword = crypto.randomBytes(4).toString('hex');

    // Hash the password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create the team member
    const teamMember = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      verified: true, // Team members are auto-verified
      verificationToken: null
    });

    // Send invitation email with credentials
    try {
      await sendTeamMemberInvitation(email, {
        firstName,
        lastName,
        role
      }, tempPassword);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the creation if email fails
    }

    // Return response without password
    return res.status(201).json({
      msg: "Team member created successfully",
      user: {
        id: teamMember.id,
        firstName: teamMember.firstName,
        lastName: teamMember.lastName,
        email: teamMember.email,
        role: teamMember.role,
        verified: teamMember.verified
      },
      tempPassword: tempPassword, // Send password in response for admin reference
      emailSent: true
    });

  } catch (error) {
    console.error("Error creating team member:", error);
    return res.status(500).json({
      msg: "Failed to create team member",
      error: error.message
    });
  }
};

// Get all team members (Admin/SuperAdmin only)
const getTeamMembers = async (req, res) => {
  try {
    // Check if requesting user is admin or superadmin
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({
        msg: "Unauthorized: Only admins can view team members"
      });
    }

    const teamMembers = await User.findAll({
      where: {
        role: {
          [Op.in]: ['admin', 'superadmin']
        }
      },
      attributes: {
        exclude: [
          'password',
          'resetPasswordOTP',
          'resetPasswordToken',
          'resetPasswordExpires',
          'verificationToken'
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      teamMembers,
      count: teamMembers.length
    });

  } catch (error) {
    console.error("Error fetching team members:", error);
    return res.status(500).json({
      msg: "Failed to fetch team members",
      error: error.message
    });
  }
};

module.exports = {
  register,
  create,
  login,
  adminLogin,
  superAdminLogin,
  refresh,
  readId,
  readall,
  countUsers,
  update,
  deleteId,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyOTP,
  readSubscribedUsers,

  // New enhanced profile functions
  updateProfile,
  getProfile: profile, // Use existing profile function or replace with getProfile
  uploadProfileImage,
  changePassword,
  manualSubscribe,
  manualUnsubscribe,

  // Team member management
  createTeamMember,
  getTeamMembers
};
