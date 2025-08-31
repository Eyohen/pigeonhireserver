// // controller/adminAnalytics.js - Working version using existing APIs
// const { Request, Response } = require("express");
// const db = require("../models");
// const { Op } = require("sequelize");
// const { 
//   User, 
//   Community, 
//   Connector, 
//   Subscription, 
//   Currency
// } = db;

// // Get overall admin analytics dashboard
// const getAdminAnalytics = async (req, res) => {
//   try {
//     // Total registered users
//     const totalUsers = await User.count();

//     // Active users (estimate - you can add lastLoginDate field later)
//     const activeUsers = Math.floor(totalUsers * 0.7); // Estimate 70% active

//     // Total communities
//     const totalCommunities = await Community.count({
//       where: { restrict: false }
//     });

//     // Total connectors
//     const totalConnectors = await Connector.count({
//       where: { restrict: false }
//     });

//     // Subscription analytics (if Subscription model exists)
//     let totalSubscriptions = 0;
//     let activeSubscriptions = 0;
//     let subscriptionRevenue = 0;
    
//     try {
//       totalSubscriptions = await Subscription.count();
//       activeSubscriptions = await Subscription.count({
//         where: {
//           status: 'active'
//         }
//       });
      
//       subscriptionRevenue = await Subscription.sum('amount', {
//         where: {
//           status: ['active', 'cancelled']
//         }
//       }) || 0;
//     } catch (error) {
//       console.log('Subscription queries failed - table might not exist:', error.message);
//     }

//     // Transaction analytics (basic count)
//     const totalTransactionVolume = totalSubscriptions; // Simple fallback

//     // Get revenue by currency (if available)
//     let revenueByNGN = 0;
//     let revenueByCAD = 0;
//     let revenueByUSD = 0;

//     try {
//       revenueByNGN = await Subscription.sum('amount', {
//         where: {
//           currency: 'NGN',
//           status: ['active', 'cancelled']
//         }
//       }) || 0;

//       revenueByCAD = await Subscription.sum('amount', {
//         where: {
//           currency: 'CAD',
//           status: ['active', 'cancelled']
//         }
//       }) || 0;

//       revenueByUSD = await Subscription.sum('amount', {
//         where: {
//           currency: 'USD',
//           status: ['active', 'cancelled']
//         }
//       }) || 0;
//     } catch (error) {
//       console.log('Currency revenue queries failed:', error.message);
//     }

//     return res.status(200).json({
//       totalUsers,
//       activeUsers,
//       totalCommunities,
//       totalConnectors,
//       totalSubscriptions,
//       activeSubscriptions,
//       subscriptionRevenue,
//       totalTransactionVolume,
//       revenueBreakdown: {
//         NGN: revenueByNGN,
//         CAD: revenueByCAD,
//         USD: revenueByUSD
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching admin analytics:", error);
//     return res.status(500).json({ 
//       msg: "Failed to fetch admin analytics", 
//       error: error.message 
//     });
//   }
// };

// // Get top communities by various metrics
// const getTopCommunities = async (req, res) => {
//   try {
//     const { metric = 'name', limit = 5 } = req.query;

//     // For now, just return top communities by name
//     // Later we can add proper analytics tables
//     const topCommunities = await Community.findAll({
//       where: { restrict: false },
//       limit: parseInt(limit),
//       order: [['createdAt', 'DESC']],
//       attributes: ['id', 'name', 'description']
//     });

//     // Add mock metrics for now
//     const communitiesWithMetrics = topCommunities.map((community, index) => ({
//       id: community.id,
//       name: community.name,
//       description: community.description,
//       viewCount: Math.floor(Math.random() * 1000) + (5 - index) * 100, // Mock data
//       contactCount: Math.floor(Math.random() * 50) + (5 - index) * 10, // Mock data
//       engagementScore: Math.floor(Math.random() * 500) + (5 - index) * 50, // Mock data
//       revenueGenerated: Math.floor(Math.random() * 5000) + (5 - index) * 500 // Mock data
//     }));

//     return res.status(200).json({
//       metric,
//       topCommunities: communitiesWithMetrics
//     });

//   } catch (error) {
//     console.error("Error fetching top communities:", error);
//     return res.status(500).json({ 
//       msg: "Failed to fetch top communities", 
//       error: error.message 
//     });
//   }
// };

// // Get subscription trends over time
// const getSubscriptionTrends = async (req, res) => {
//   try {
//     const { period = 'monthly', months = 6 } = req.query;
    
//     // Mock data for now - you can implement real logic later
//     const trends = [];
//     const currentDate = new Date();
    
//     for (let i = parseInt(months) - 1; i >= 0; i--) {
//       const date = new Date(currentDate);
//       date.setMonth(date.getMonth() - i);
      
//       trends.push({
//         period: date.toISOString().slice(0, 7), // YYYY-MM format
//         subscriptions: Math.floor(Math.random() * 50) + 10,
//         revenue: Math.floor(Math.random() * 5000) + 1000,
//         currency: 'USD'
//       });
//     }

//     return res.status(200).json({
//       period,
//       trends
//     });

//   } catch (error) {
//     console.error("Error fetching subscription trends:", error);
//     return res.status(500).json({ 
//       msg: "Failed to fetch subscription trends", 
//       error: error.message 
//     });
//   }
// };

// // Get user activity metrics
// const getUserActivity = async (req, res) => {
//   try {
//     const { days = 30 } = req.query;
    
//     // Mock data for now
//     const activity = {
//       profileViews: [],
//       contacts: []
//     };
    
//     const currentDate = new Date();
    
//     for (let i = parseInt(days) - 1; i >= 0; i--) {
//       const date = new Date(currentDate);
//       date.setDate(date.getDate() - i);
      
//       activity.profileViews.push({
//         date: date.toISOString().slice(0, 10),
//         views: Math.floor(Math.random() * 100) + 10
//       });
      
//       activity.contacts.push({
//         date: date.toISOString().slice(0, 10),
//         contacts: Math.floor(Math.random() * 20) + 1
//       });
//     }

//     return res.status(200).json({
//       days: parseInt(days),
//       ...activity
//     });

//   } catch (error) {
//     console.error("Error fetching user activity:", error);
//     return res.status(500).json({ 
//       msg: "Failed to fetch user activity", 
//       error: error.message 
//     });
//   }
// };

// module.exports = {
//   getAdminAnalytics,
//   getTopCommunities,
//   getSubscriptionTrends,
//   getUserActivity
// };





// controller/adminAnalytics.js
const db = require('../models');
const { Op } = require('sequelize');
const { User, Community, Connector, Subscription, UserAnalytics, ContactLog, ProfileView, Lead, Network } = db;

// Get comprehensive admin analytics dashboard
const getAdminAnalytics = async (req, res) => {
  try {
    // Get date ranges for comparisons
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
    const twoYearsAgo = new Date(now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));

    // User metrics
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      }
    });
    const totalSubscribers = await User.count({
      where: { subscribed: true }
    });
    const activeSubscribers = await Subscription.count({
      where: {
        status: 'active',
        endDate: { [Op.gt]: now }
      }
    });

    // Community and Connector metrics
    const totalCommunities = await Community.count({
      where: { restrict: false }
    });
    const totalConnectors = await Connector.count({
      where: { restrict: false }
    });

    // Revenue metrics (if you have transaction data)
    const subscriptionRevenue = await Subscription.sum('amount', {
      where: {
        status: 'active',
        createdAt: { [Op.gte]: sixMonthsAgo }
      }
    }) || 0;

    // Transaction metrics
    const totalTransactionVolume = await ContactLog.count();
    const totalTransactionValue = subscriptionRevenue; // Placeholder
    
    return res.status(200).json({
      userMetrics: {
        totalUsers,
        activeUsers,
        totalSubscribers,
        activeSubscribers
      },
      contentMetrics: {
        totalCommunities,
        totalConnectors
      },
      revenueMetrics: {
        subscriptionRevenue,
        payGRevenue: 20000, // Placeholder
        totalTransactionVolume,
        totalTransactionValue: subscriptionRevenue
      }
    });

  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return res.status(500).json({
      msg: 'Failed to fetch admin analytics',
      error: error.message
    });
  }
};

// Get top communities by revenue or engagement
const getTopCommunities = async (req, res) => {
  try {
    const { metric = 'revenue', limit = 5 } = req.query;
    
    let communities;
    
    if (metric === 'revenue') {
      // Get communities with most subscription revenue
      communities = await Community.findAll({
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']], // Placeholder ordering
        attributes: ['id', 'name', 'rating', 'createdAt'],
        where: { restrict: false }
      });
    } else {
      // Get communities by other metrics
      communities = await Community.findAll({
        limit: parseInt(limit),
        order: [['rating', 'DESC']],
        attributes: ['id', 'name', 'rating', 'createdAt'],
        where: { restrict: false }
      });
    }

    // Transform data for frontend chart
    const chartData = communities.map((community, index) => ({
      name: community.name,
      value: Math.max(20, 100 - (index * 20)) // Placeholder values
    }));

    return res.status(200).json({
      communities: chartData
    });

  } catch (error) {
    console.error('Error fetching top communities:', error);
    return res.status(500).json({
      msg: 'Failed to fetch top communities',
      error: error.message
    });
  }
};

// Get subscription trends over time
const getSubscriptionTrends = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter;
    if (period === '30d') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '90d') {
      dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    } else {
      dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    }

    const subscriptions = await Subscription.findAll({
      where: {
        createdAt: { [Op.gte]: dateFilter }
      },
      attributes: ['createdAt', 'amount', 'planType'],
      order: [['createdAt', 'ASC']]
    });

    return res.status(200).json({
      subscriptions
    });

  } catch (error) {
    console.error('Error fetching subscription trends:', error);
    return res.status(500).json({
      msg: 'Failed to fetch subscription trends',
      error: error.message
    });
  }
};

// Get user activity metrics
const getUserActivity = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const profileViews = await ProfileView.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    const contacts = await ContactLog.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    const leads = await Lead.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    const networks = await Network.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
    });

    return res.status(200).json({
      activity: {
        profileViews,
        contacts,
        leads,
        networks
      }
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return res.status(500).json({
      msg: 'Failed to fetch user activity',
      error: error.message
    });
  }
};

module.exports = {
  getAdminAnalytics,
  getTopCommunities,
  getSubscriptionTrends,
  getUserActivity
};