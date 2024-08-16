const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
// const RequestWithUser = require('../utils/RequestWithUser');
const { User } = db;

  const register = async (req, res) => {
    try {
      const { firstName, lastName, phone, city, address, country, email, password } = req.body;

      // Check if user with the given email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ msg: 'User with this email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user record with hashed password
      const record = await User.create({ ...req.body, email, password: hashedPassword });
      return res.status(200).json({ record, msg: "User successfully created" });
    } catch (error) {
      console.log("henry", error);
      return res.status(500).json({ msg: "Failed to register user", error });
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

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      const userPayload = {
        id: user.id,
        email: user.email,
        fname: user.firstName,
        lname: user.lastName
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
      const { firstName, lastName, email, password } = req.body;

      // Check if user with the given email exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      // Check if user's role is admin
      if (user.role !== 'admin') {
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
        lname: user.lastName
      };

      // Generate JWT token with user object
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


      return res.status(200).json({ accessToken, refreshToken, user: userPayload });
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

  module.exports = {register, login, adminLogin, refresh};