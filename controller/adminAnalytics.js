// // controller/adminAnalytics.js
// const db = require('../models');
// const { Op } = require('sequelize');
// const { User, Community, Connector, Subscription, UserAnalytics, ContactLog, ProfileView, Lead, Network } = db;



// // Helper function to get date range based on period
// const getDateRange = (period, startDate, endDate) => {
//   const now = new Date();
  
//   switch (period) {
//     case '7d':
//       return { startDate: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)), endDate: now };
//     case '30d':
//       return { startDate: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)), endDate: now };
//     case '90d':
//       return { startDate: new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)), endDate: now };
//     case '6m':
//       return { startDate: new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)), endDate: now };
//     case '1y':
//       return { startDate: new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)), endDate: now };
//     case 'custom':
//       return startDate && endDate ? { 
//         startDate: new Date(startDate), 
//         endDate: new Date(endDate + 'T23:59:59.999Z') 
//       } : null;
//     default:
//       return null; // All time
//   }
// };

// // Get comprehensive admin analytics dashboard
// // const getAdminAnalytics = async (req, res) => {
// //   try {
// //     // Get date ranges for comparisons
// //     const now = new Date();
// //     const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
// //     const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
// //     const twoYearsAgo = new Date(now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));

// //     // User metrics
// //     const totalUsers = await User.count();
// //     const activeUsers = await User.count({
// //       where: {
// //         createdAt: { [Op.gte]: sixMonthsAgo }
// //       }
// //     });
// //     const totalSubscribers = await User.count({
// //       where: { subscribed: true }
// //     });
// //     const activeSubscribers = await Subscription.count({
// //       where: {
// //         status: 'active',
// //         endDate: { [Op.gt]: now }
// //       }
// //     });

// //     // Community and Connector metrics
// //     const totalCommunities = await Community.count({
// //       where: { restrict: false }
// //     });
// //     const totalConnectors = await Connector.count({
// //       where: { restrict: false }
// //     });

// //     // Revenue metrics (if you have transaction data)
// //     const subscriptionRevenue = await Subscription.sum('amount', {
// //       where: {
// //         status: 'active',
// //         createdAt: { [Op.gte]: sixMonthsAgo }
// //       }
// //     }) || 0;

// //     // Transaction metrics
// //     const totalTransactionVolume = await ContactLog.count();
// //     const totalTransactionValue = subscriptionRevenue; // Placeholder
    
// //     return res.status(200).json({
// //       userMetrics: {
// //         totalUsers,
// //         activeUsers,
// //         totalSubscribers,
// //         activeSubscribers
// //       },
// //       contentMetrics: {
// //         totalCommunities,
// //         totalConnectors
// //       },
// //       revenueMetrics: {
// //         subscriptionRevenue,
// //         payGRevenue: 20000, // Placeholder
// //         totalTransactionVolume,
// //         totalTransactionValue: subscriptionRevenue
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error fetching admin analytics:', error);
// //     return res.status(500).json({
// //       msg: 'Failed to fetch admin analytics',
// //       error: error.message
// //     });
// //   }
// // };

// // Get comprehensive admin analytics dashboard
// const getAdminAnalytics = async (req, res) => {
//   try {
//     const { period, startDate, endDate } = req.query;
//     const dateRange = getDateRange(period, startDate, endDate);
    
//     // Build date filter condition
//     const dateFilter = dateRange ? {
//       createdAt: {
//         [Op.between]: [dateRange.startDate, dateRange.endDate]
//       }
//     } : {};

//     // User metrics
//     const totalUsers = await User.count(dateRange ? { where: dateFilter } : {});
    
//     const activeUsers = await User.count({
//       where: {
//         ...dateFilter,
//         // Consider users who have logged in or have activity in the period
//       }
//     });
    
//     const totalSubscribers = await User.count({
//       where: {
//         subscribed: true,
//         ...(dateRange ? dateFilter : {})
//       }
//     });
    
//     const activeSubscribers = await Subscription.count({
//       where: {
//         status: 'active',
//         ...(dateRange ? dateFilter : {}),
//         endDate: { [Op.gt]: new Date() }
//       }
//     });

//     // Community and Connector metrics
//     const totalCommunities = await Community.count({
//       where: {
//         restrict: false,
//         ...(dateRange ? dateFilter : {})
//       }
//     });
    
//     const totalConnectors = await Connector.count({
//       where: {
//         restrict: false,
//         ...(dateRange ? dateFilter : {})
//       }
//     });

//     // Revenue metrics
//     const subscriptionRevenue = await Subscription.sum('amount', {
//       where: {
//         status: { [Op.in]: ['active', 'completed'] },
//         ...(dateRange ? dateFilter : {})
//       }
//     }) || 0;

//     // Transaction metrics
//     const totalTransactionVolume = await ContactLog.count({
//       where: dateRange ? dateFilter : {}
//     });
    
//     return res.status(200).json({
//       userMetrics: {
//         totalUsers,
//         activeUsers,
//         totalSubscribers,
//         activeSubscribers
//       },
//       contentMetrics: {
//         totalCommunities,
//         totalConnectors
//       },
//       revenueMetrics: {
//         subscriptionRevenue: Math.round(subscriptionRevenue * 100) / 100,
//         payGRevenue: 20000, // Placeholder
//         totalTransactionVolume,
//         totalTransactionValue: Math.round(subscriptionRevenue * 100) / 100
//       },
//       period: period || 'all',
//       dateRange: dateRange ? {
//         start: dateRange.startDate.toISOString().split('T')[0],
//         end: dateRange.endDate.toISOString().split('T')[0]
//       } : null
//     });

//   } catch (error) {
//     console.error('Error fetching admin analytics:', error);
//     return res.status(500).json({
//       msg: 'Failed to fetch admin analytics',
//       error: error.message
//     });
//   }
// };

// // Get top communities by revenue or engagement
// // const getTopCommunities = async (req, res) => {
// //   try {
// //     const { metric = 'revenue', limit = 5 } = req.query;
    
// //     let communities;
    
// //     if (metric === 'revenue') {
// //       // Get communities with most subscription revenue
// //       communities = await Community.findAll({
// //         limit: parseInt(limit),
// //         order: [['createdAt', 'DESC']], // Placeholder ordering
// //         attributes: ['id', 'name', 'rating', 'createdAt'],
// //         where: { restrict: false }
// //       });
// //     } else {
// //       // Get communities by other metrics
// //       communities = await Community.findAll({
// //         limit: parseInt(limit),
// //         order: [['rating', 'DESC']],
// //         attributes: ['id', 'name', 'rating', 'createdAt'],
// //         where: { restrict: false }
// //       });
// //     }

// //     // Transform data for frontend chart
// //     const chartData = communities.map((community, index) => ({
// //       name: community.name,
// //       value: Math.max(20, 100 - (index * 20)) // Placeholder values
// //     }));

// //     return res.status(200).json({
// //       communities: chartData
// //     });

// //   } catch (error) {
// //     console.error('Error fetching top communities:', error);
// //     return res.status(500).json({
// //       msg: 'Failed to fetch top communities',
// //       error: error.message
// //     });
// //   }
// // };

// // Get top communities by revenue or engagement
// const getTopCommunities = async (req, res) => {
//   try {
//     const { metric = 'revenue', limit = 5, period, startDate, endDate } = req.query;
//     const dateRange = getDateRange(period, startDate, endDate);
    
//     // Build date filter condition
//     const dateFilter = dateRange ? {
//       createdAt: {
//         [Op.between]: [dateRange.startDate, dateRange.endDate]
//       }
//     } : {};
    
//     let communities;
    
//     if (metric === 'revenue') {
//       // Get communities with most subscription revenue (you may need to adjust this logic)
//       communities = await Community.findAll({
//         limit: parseInt(limit),
//         where: { 
//           restrict: false,
//           ...(dateRange ? dateFilter : {})
//         },
//         attributes: ['id', 'name', 'rating', 'createdAt'],
//         order: [['createdAt', 'DESC']]
//       });
//     } else {
//       // Get communities by rating or other metrics
//       communities = await Community.findAll({
//         limit: parseInt(limit),
//         where: { 
//           restrict: false,
//           ...(dateRange ? dateFilter : {})
//         },
//         attributes: ['id', 'name', 'rating', 'createdAt'],
//         order: [['rating', 'DESC']]
//       });
//     }

//     // Transform data for frontend chart
//     const chartData = communities.map((community, index) => {
//       // Calculate engagement score based on rating and other factors
//       const baseScore = community.rating ? Math.round(community.rating * 20) : 20;
//       const timeBonus = Math.max(0, 10 - index * 2); // Newer communities get slight bonus
      
//       return {
//         name: community.name,
//         value: Math.min(100, baseScore + timeBonus),
//         rating: community.rating,
//         createdAt: community.createdAt
//       };
//     });

//     return res.status(200).json({
//       communities: chartData,
//       period: period || 'all',
//       metric
//     });

//   } catch (error) {
//     console.error('Error fetching top communities:', error);
//     return res.status(500).json({
//       msg: 'Failed to fetch top communities',
//       error: error.message
//     });
//   }
// };


// // Get subscription trends over time
// // const getSubscriptionTrends = async (req, res) => {
// //   try {
// //     const { period = '30d' } = req.query;
    
// //     let dateFilter;
// //     if (period === '30d') {
// //       dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
// //     } else if (period === '90d') {
// //       dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
// //     } else {
// //       dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
// //     }

// //     const subscriptions = await Subscription.findAll({
// //       where: {
// //         createdAt: { [Op.gte]: dateFilter }
// //       },
// //       attributes: ['createdAt', 'amount', 'planType'],
// //       order: [['createdAt', 'ASC']]
// //     });

// //     return res.status(200).json({
// //       subscriptions
// //     });

// //   } catch (error) {
// //     console.error('Error fetching subscription trends:', error);
// //     return res.status(500).json({
// //       msg: 'Failed to fetch subscription trends',
// //       error: error.message
// //     });
// //   }
// // };
// const getSubscriptionTrends = async (req, res) => {
//   try {
//     const { period = '30d', startDate, endDate } = req.query;
//     const dateRange = getDateRange(period, startDate, endDate);
    
//     let dateFilter;
//     if (dateRange) {
//       dateFilter = {
//         createdAt: {
//           [Op.between]: [dateRange.startDate, dateRange.endDate]
//         }
//       };
//     } else {
//       // Default to last 30 days if no filter
//       dateFilter = {
//         createdAt: { 
//           [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
//         }
//       };
//     }

//     const subscriptions = await Subscription.findAll({
//       where: dateFilter,
//       attributes: ['createdAt', 'amount', 'planType', 'status'],
//       order: [['createdAt', 'ASC']]
//     });

//     // Group subscriptions by date for trend analysis
//     const trendData = subscriptions.reduce((acc, sub) => {
//       const date = sub.createdAt.toISOString().split('T')[0];
//       if (!acc[date]) {
//         acc[date] = { date, count: 0, revenue: 0 };
//       }
//       acc[date].count += 1;
//       acc[date].revenue += parseFloat(sub.amount);
//       return acc;
//     }, {});

//     const trends = Object.values(trendData).sort((a, b) => new Date(a.date) - new Date(b.date));

//     return res.status(200).json({
//       subscriptions: trends,
//       totalSubscriptions: subscriptions.length,
//       totalRevenue: subscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount), 0),
//       period: period || '30d'
//     });

//   } catch (error) {
//     console.error('Error fetching subscription trends:', error);
//     return res.status(500).json({
//       msg: 'Failed to fetch subscription trends',
//       error: error.message
//     });
//   }
// };


// // Get user activity metrics
// // const getUserActivity = async (req, res) => {
// //   try {
// //     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

// //     const profileViews = await ProfileView.count({
// //       where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
// //     });

// //     const contacts = await ContactLog.count({
// //       where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
// //     });

// //     const leads = await Lead.count({
// //       where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
// //     });

// //     const networks = await Network.count({
// //       where: { createdAt: { [Op.gte]: thirtyDaysAgo } }
// //     });

// //     return res.status(200).json({
// //       activity: {
// //         profileViews,
// //         contacts,
// //         leads,
// //         networks
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Error fetching user activity:', error);
// //     return res.status(500).json({
// //       msg: 'Failed to fetch user activity',
// //       error: error.message
// //     });
// //   }
// // };

// const getUserActivity = async (req, res) => {
//   try {
//     const { period = '30d', startDate, endDate } = req.query;
//     const dateRange = getDateRange(period, startDate, endDate);
    
//     const dateFilter = dateRange ? {
//       createdAt: {
//         [Op.between]: [dateRange.startDate, dateRange.endDate]
//       }
//     } : {
//       createdAt: { 
//         [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
//       }
//     };

//     const [profileViews, contacts, leads, networks] = await Promise.all([
//       ProfileView.count({ where: dateFilter }),
//       ContactLog.count({ where: dateFilter }),
//       Lead.count({ where: dateFilter }),
//       Network.count({ where: dateFilter })
//     ]);

//     return res.status(200).json({
//       activity: {
//         profileViews,
//         contacts,
//         leads,
//         networks
//       },
//       period: period || '30d',
//       dateRange: dateRange ? {
//         start: dateRange.startDate.toISOString().split('T')[0],
//         end: dateRange.endDate.toISOString().split('T')[0]
//       } : null
//     });

//   } catch (error) {
//     console.error('Error fetching user activity:', error);
//     return res.status(500).json({
//       msg: 'Failed to fetch user activity',
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

// Helper function to get date range based on period
const getDateRange = (period, startDate, endDate) => {
  const now = new Date();
  
  switch (period) {
    case '7d':
      return { startDate: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)), endDate: now };
    case '30d':
      return { startDate: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)), endDate: now };
    case '90d':
      return { startDate: new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)), endDate: now };
    case '6m':
      return { startDate: new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000)), endDate: now };
    case '1y':
      return { startDate: new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)), endDate: now };
    case 'custom':
      return startDate && endDate ? { 
        startDate: new Date(startDate), 
        endDate: new Date(endDate + 'T23:59:59.999Z') 
      } : null;
    default:
      return null; // All time
  }
};

// Get comprehensive admin analytics dashboard
const getAdminAnalytics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const dateRange = getDateRange(period, startDate, endDate);
    
    // Build date filter condition
    const dateFilter = dateRange ? {
      createdAt: {
        [Op.between]: [dateRange.startDate, dateRange.endDate]
      }
    } : {};

    // User metrics
    const totalUsers = await User.count(dateRange ? { where: dateFilter } : {});
    
    const activeUsers = await User.count({
      where: {
        ...dateFilter,
        // Consider users who have logged in or have activity in the period
      }
    });
    
    const totalSubscribers = await User.count({
      where: {
        subscribed: true,
        ...(dateRange ? dateFilter : {})
      }
    });
    
    const activeSubscribers = await Subscription.count({
      where: {
        status: 'active',
        ...(dateRange ? dateFilter : {}),
        endDate: { [Op.gt]: new Date() }
      }
    });

    // Community and Connector metrics
    const totalCommunities = await Community.count({
      where: {
        restrict: false,
        ...(dateRange ? dateFilter : {})
      }
    });
    
    const totalConnectors = await Connector.count({
      where: {
        restrict: false,
        ...(dateRange ? dateFilter : {})
      }
    });

    // Revenue metrics
    const subscriptionRevenue = await Subscription.sum('amount', {
      where: {
        status: 'active',
        ...(dateRange ? dateFilter : {})
      }
    }) || 0;

    // Transaction metrics
    const totalTransactionVolume = await ContactLog.count({
      where: dateRange ? dateFilter : {}
    });
    
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
        subscriptionRevenue: Math.round(subscriptionRevenue * 100) / 100,
        payGRevenue: 20000, // Placeholder
        totalTransactionVolume,
        totalTransactionValue: Math.round(subscriptionRevenue * 100) / 100
      },
      period: period || 'all',
      dateRange: dateRange ? {
        start: dateRange.startDate.toISOString().split('T')[0],
        end: dateRange.endDate.toISOString().split('T')[0]
      } : null
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
    const { metric = 'revenue', limit = 5, period, startDate, endDate } = req.query;
    const dateRange = getDateRange(period, startDate, endDate);
    
    // Build date filter condition
    const dateFilter = dateRange ? {
      createdAt: {
        [Op.between]: [dateRange.startDate, dateRange.endDate]
      }
    } : {};
    
    let communities;
    
    if (metric === 'revenue') {
      // Get communities with most subscription revenue (you may need to adjust this logic)
      communities = await Community.findAll({
        limit: parseInt(limit),
        where: { 
          restrict: false,
          ...(dateRange ? dateFilter : {})
        },
        attributes: ['id', 'name', 'rating', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // Get communities by rating or other metrics
      communities = await Community.findAll({
        limit: parseInt(limit),
        where: { 
          restrict: false,
          ...(dateRange ? dateFilter : {})
        },
        attributes: ['id', 'name', 'rating', 'createdAt'],
        order: [['rating', 'DESC']]
      });
    }

    // Transform data for frontend chart
    const chartData = communities.map((community, index) => {
      // Calculate engagement score based on rating and other factors
      const baseScore = community.rating ? Math.round(community.rating * 20) : 20;
      const timeBonus = Math.max(0, 10 - index * 2); // Newer communities get slight bonus
      
      return {
        name: community.name,
        value: Math.min(100, baseScore + timeBonus),
        rating: community.rating,
        createdAt: community.createdAt
      };
    });

    return res.status(200).json({
      communities: chartData,
      period: period || 'all',
      metric
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
    const { period = '30d', startDate, endDate } = req.query;
    const dateRange = getDateRange(period, startDate, endDate);
    
    let dateFilter;
    if (dateRange) {
      dateFilter = {
        createdAt: {
          [Op.between]: [dateRange.startDate, dateRange.endDate]
        }
      };
    } else {
      // Default to last 30 days if no filter
      dateFilter = {
        createdAt: { 
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        }
      };
    }

    const subscriptions = await Subscription.findAll({
      where: dateFilter,
      attributes: ['createdAt', 'amount', 'planType', 'status'],
      order: [['createdAt', 'ASC']]
    });

    // Group subscriptions by date for trend analysis
    const trendData = subscriptions.reduce((acc, sub) => {
      const date = sub.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, revenue: 0 };
      }
      acc[date].count += 1;
      acc[date].revenue += parseFloat(sub.amount);
      return acc;
    }, {});

    const trends = Object.values(trendData).sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      subscriptions: trends,
      totalSubscriptions: subscriptions.length,
      totalRevenue: subscriptions.reduce((sum, sub) => sum + parseFloat(sub.amount), 0),
      period: period || '30d'
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
    const { period = '30d', startDate, endDate } = req.query;
    const dateRange = getDateRange(period, startDate, endDate);
    
    const dateFilter = dateRange ? {
      createdAt: {
        [Op.between]: [dateRange.startDate, dateRange.endDate]
      }
    } : {
      createdAt: { 
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
      }
    };

    const [profileViews, contacts, leads, networks] = await Promise.all([
      ProfileView.count({ where: dateFilter }),
      ContactLog.count({ where: dateFilter }),
      Lead.count({ where: dateFilter }),
      Network.count({ where: dateFilter })
    ]);

    return res.status(200).json({
      activity: {
        profileViews,
        contacts,
        leads,
        networks
      },
      period: period || '30d',
      dateRange: dateRange ? {
        start: dateRange.startDate.toISOString().split('T')[0],
        end: dateRange.endDate.toISOString().split('T')[0]
      } : null
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