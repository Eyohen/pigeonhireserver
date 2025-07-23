// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../models');
const { User } = db;

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        msg: 'Access denied. No token provided.',
        error: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN_HERE
    
    if (!token) {
      return res.status(401).json({ 
        msg: 'Access denied. Invalid token format.',
        error: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.user.id);
    if (!user) {
      return res.status(401).json({ 
        msg: 'Access denied. User not found.',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(401).json({ 
        msg: 'Access denied. Please verify your email.',
        error: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Add user info to request
    req.user = decoded.user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        msg: 'Access denied. Invalid token.',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        msg: 'Access denied. Token expired.',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(500).json({ 
      msg: 'Token verification failed.',
      error: 'VERIFICATION_FAILED'
    });
  }
};

// Admin access middleware
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        msg: 'Access denied. Authentication required.',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        msg: 'Access denied. Admin privileges required.',
        error: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ 
      msg: 'Authorization check failed.',
      error: 'AUTHORIZATION_FAILED'
    });
  }
};

// Super admin access middleware
const requireSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        msg: 'Access denied. Authentication required.',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        msg: 'Access denied. Super admin privileges required.',
        error: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    return res.status(500).json({ 
      msg: 'Authorization check failed.',
      error: 'AUTHORIZATION_FAILED'
    });
  }
};

// Check if user owns the resource or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        msg: 'Access denied. Authentication required.',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    const { userId } = req.params;
    const currentUserId = req.user.id;
    const userRole = req.user.role;

    // Allow if user is admin/superadmin or owns the resource
    if (userRole === 'admin' || userRole === 'superadmin' || currentUserId === userId) {
      next();
    } else {
      return res.status(403).json({ 
        msg: 'Access denied. You can only access your own resources.',
        error: 'INSUFFICIENT_PRIVILEGES'
      });
    }
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({ 
      msg: 'Authorization check failed.',
      error: 'AUTHORIZATION_FAILED'
    });
  }
};

// Check subscription status
const requireSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        msg: 'Access denied. Authentication required.',
        error: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Get fresh user data to check subscription status
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(401).json({ 
        msg: 'Access denied. User not found.',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.subscribed) {
      return res.status(403).json({ 
        msg: 'Access denied. Active subscription required.',
        error: 'SUBSCRIPTION_REQUIRED'
      });
    }

    // Update req.user with fresh subscription status
    req.user.subscribed = user.subscribed;
    
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({ 
      msg: 'Subscription check failed.',
      error: 'SUBSCRIPTION_CHECK_FAILED'
    });
  }
};

// Optional auth - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findByPk(decoded.user.id);
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = decoded.user;
    req.token = token;
    
    next();
  } catch (error) {
    // On error, just set user to null and continue
    req.user = null;
    next();
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireSuperAdmin,
  requireOwnershipOrAdmin,
  requireSubscription,
  optionalAuth
};