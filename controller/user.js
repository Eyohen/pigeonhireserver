const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
// const RequestWithUser = require('../utils/RequestWithUser');
const { User } = db;

  const register = async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

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
      const { email, password } = req.body;

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

      // Generate JWT token
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET, // Use a secure secret key, preferably from environment variables
        { expiresIn: '14d' } // Token expiration time
      );

      return res.status(200).json({ accessToken });
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

  const readall = async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;

      const records = await User.findAll({ limit, offset });
      return res.json(records);
    } catch (e) {
      return res.json({ msg: "Failed to read", status: 500, route: "/read" });
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


module.exports = {register, login, adminLogin, refresh, readId, readall, update, deleteId};