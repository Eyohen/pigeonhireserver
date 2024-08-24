const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
// const RequestWithUser = require('../utils/RequestWithUser');
const { User } = db;
const {sendVerificationEmail} = require('../utils/nodemailer');
const crypto = require('crypto');
const {sendResetPasswordEmail} = require('../utils/nodemailer')
const { totalmem } = require("os");
const { Op } = require('sequelize');
const { permission } = require('process');


  const register = async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user with the given email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ msg: 'invalid credentials used' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      //create verification token
      const verificationToken = await uuidv4();

      // Create the user record with hashed password
      const record = await User.create({ ...req.body, email, password: hashedPassword, verificationToken });

      //send verification email
      sendVerificationEmail(email, verificationToken);


      return res.status(200).json({ record, msg: "User successfully created" });
    } catch (error) {
      console.log("henry", error);
      return res.status(500).json({ msg: "Failed to register user", error });
    }
  }


  const verifyEmail= async (req, res) => {
    try {
      const {token} = req.query;

      console.log('toeiehe', token)

      //find the user with the provided token
      const user = await User.findOne({where: {verificationToken: token}});
      console.log({user})

      if(!user) {
        return res.status(400).json({msg: 'Invalid or expired token'});
      }

      // verify the user 
      await user.update({verified : true, verificationToken : null});
      // user.verified = true;
      // user.verificationToken = null;
      await user.save();

      return res.status(200).json({msg: 'Email successfully verified'})

    } catch (error) {
      console.error('Error verifying email:', error);
      return res.status(500).json({ msg: 'Failed to verify email', error });
    }
  }


  const login = async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user with the given email exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // check if users email is verified
      if(!user.verified){
        return res.status(401).json({msg: "Please verify your email to log in"});
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      const userPayload = {
        id: user.id,
        email: user.email,
        fname: user.firstName,
        lname: user.lastName,
        role: user.role
      };

      // Generate JWT token with user object
      const accessToken = jwt.sign(
        { user: userPayload },
        process.env.JWT_SECRET, // Use a secure secret key, preferably from environment variables
        { expiresIn: '14d' } // Token expiration time
      );

      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { user: userPayload },
        process.env.JWT_REFRESH_SECRET, // Use a secure refresh secret key
        { expiresIn: '14d' } // Refresh token expiration time
      );

      return res.status(200).json({ accessToken, refreshToken, user: userPayload });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ msg: 'Failed to log in', error });
    }
  }

  const adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user with the given email exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if user's role is admin or superadmin
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(401).json({ msg: 'Unauthorized access: Only admins are allowed' });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      const userPayload = {
        id: user.id,
        email: user.email,
        fname: user.firstName,
        lname: user.lastName,
        role: user.role
      };


      // Generate JWT token
      const accessToken = jwt.sign(
        {user: userPayload},
        // { userId: user.id, email: user.email },
        process.env.JWT_SECRET, // Use a secure secret key, preferably from environment variables
        { expiresIn: '14d' } // Token expiration time
      );

            // Generate Refresh Token
            const refreshToken = jwt.sign(
              { user: userPayload },
              process.env.JWT_REFRESH_SECRET, // Use a secure refresh secret key
              { expiresIn: '14d' } // Refresh token expiration time
            );
      

      return res.status(200).json({ accessToken, refreshToken, user:userPayload });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ msg: 'Failed to log in', error });
    }
  }

  const superAdminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user with the given email exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if user's role is admin or superadmin
      if (user.role !== 'superadmin' ) {
        return res.status(401).json({ msg: 'Unauthorized access: Only superadmins are allowed' });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      const userPayload = {
        id: user.id,
        email: user.email,
        fname: user.firstName,
        lname: user.lastName,
        role: user.role
      };


      // Generate JWT token
      const accessToken = jwt.sign(
        {user: userPayload},
        // { userId: user.id, email: user.email },
        process.env.JWT_SECRET, // Use a secure secret key, preferably from environment variables
        { expiresIn: '14d' } // Token expiration time
      );

            // Generate Refresh Token
            const refreshToken = jwt.sign(
              { user: userPayload },
              process.env.JWT_REFRESH_SECRET, // Use a secure refresh secret key
              { expiresIn: '14d' } // Refresh token expiration time
            );
      

      return res.status(200).json({ accessToken, refreshToken, user:userPayload });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ msg: 'Failed to log in', error });
    }
  }

  const refresh = async (req, res) => {
    const token = req.headers?.authorization?.split(' ')[1];

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
  }

const forgotPassword = async (req, res) => {
  try{
    const {email} = req.body;

    // check if user with the given email exists
    const user = await User.findOne({where:{email}});

    if(!user){
      return res.status(404).json({msg:'User not found'});
    }

    // generate a 4-digit otp
    const otp = crypto.randomInt(1000, 9999).toString().padStart(4, '0');

    // generate a unique token
    const resetToken = crypto.randomBytes(20).toString('hex');


    //save the OTP, token  and its expiration time in the user record
    user.resetPasswordOTP = otp;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // otp expires in 10 minutes
    await user.save();


    // send email with OTP
    await sendResetPasswordEmail(email, otp, resetToken);

    return res.status(200).json({msg:'Password reset OTP sent to your email', resetToken});

  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({msg:"Failed to process forgot password request", error});
  }
};


const verifyOTP = async (req, res) => {
  try{
    const {otp} = req.body;
    const resetToken = req.headers['x-reset-token']; //  get the reset token from headers

    if(!resetToken) {
      return res.status(400).json({msg:'Reset token is required'});
    }

    // find user by reset token
    const user = await User.findOne({
      where:{
        resetPasswordToken: resetToken,
        resetPasswordExpires: {[Op.gt]: Date.now()} // check if token is expired
        }
    });

    if(!user){
      return res.status(404).json({msg:'Invalid or expired reset token'});
    }

    //check if OTP is valid
    if(user.resetPasswordOTP !== otp){
      return res.status(400).json({sg:'Invalid OTP'});
    }


    //OTP is valid
    return res.status(200).json({msg:'OTP verified successfully'});
  } catch(error){
console.error('Error in OTP verification:', error);
return res.status(500).json({msg:"Failed to verify OTP", error})
  }
}

const resetPassword = async (req, res) => {
  try{
    const {newPassword} = req.body;
    const resetToken = req.headers['x-reset-token'];

    if(!resetToken){
      return res.status(400).json({msg:'Reset token is required'});
    }

    // find user by reset token
    const user = await User.findOne({where:{
      resetPasswordToken:resetToken,
      resetPasswordExpires: {[Op.gt]:Date.now()} //check if token is not expired
    }});


    if(!user){
      return res.status(404).json({msg: 'Invalid reset token'});
    }


    // hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({msg:'Password reset successful'});

  } catch (error) {
    console.error('Error in reset password:', error);
    return res.status(500).json({msg:'Failed to reset password', error})
  }
}

  const profile = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }

      const userId = req.user.id;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ msg: 'Internal server error' });
    }
  }

  // const readall = async (req, res) => {
  //   try {
  //     const limit = parseInt(req.query.limit) || 10;
  //     const offset = parseInt(req.query.offset) || 0;

  //     const records = await User.findAll({ limit, offset });
  //     return res.json(records);
  //   } catch (e) {
  //     return res.json({ msg: "Failed to read", status: 500, route: "/read" });
  //   }
  // }
  const readall = async (req, res) => {
		try {
			const { page = 1, limit = 10, search = ''} = req.query;
			const offset = (page - 1) * limit;

			const {count, rows: users} = await User.findAndCountAll({
				where: {
					firstName:{
						[Op.iLike]: `%${search}%`
					},

				},
				limit: parseInt(limit),
				offset:parseInt(offset)
			});
			return res.json({
				users,
				totalPages:Math.ceil(count / limit),
				currentPage: parseInt(page)
			});
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read" });
		}
	}

  const readId = async (req, res) => {
    try {
      const { id } = req.params;
      const record = await User.findOne({ where: { id } });
      return res.json(record);
    } catch (e) {
      return res.json({ msg: "Failed to read", status: 500, route: "/read/:id" });
    }
  }

  
	const countUsers = async (req, res) => {
		try {
			const { search = '' } = req.query;
	
			const count = await User.count({
				where: {
					firstName: {
						[Op.iLike]: `%${search}%`
					},

				}
			});
	
			return res.json({
				count: count,
				status: 200
			});
		} catch (e) {
			console.error("Error counting communities:", e);
			return res.status(500).json({ 
				msg: "Failed to count communities", 
				status: 500, 
				route: "/count" 
			});
		}
	};

  const update = async (req, res) =>{
    try {
      const updated = await User.update({ ...req.body }, { where: { id: req.params.id } });
      if (updated) {
        const updatedUser = await User.findByPk(req.params.id);
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating the User', error });
    }
  }

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
  }


module.exports = {register, login, adminLogin, superAdminLogin, refresh, readId, readall, countUsers, update, deleteId, verifyEmail, forgotPassword, resetPassword, verifyOTP};