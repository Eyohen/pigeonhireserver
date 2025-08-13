// // controller/userFavorite.js
// const db = require('../models');
// const { UserFavorite, User, Community, Connector } = db;
// const { Op } = require('sequelize');

// // Add a community to user's favorites
// const addToFavorites = async (req, res) => {
//   try {
//     const { userId, communityId } = req.body;

//     // Validate required fields
//     if (!userId || !communityId) {
//       return res.status(400).json({ 
//         msg: 'User ID and Community ID are required' 
//       });
//     }

//     // Check if user exists
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     // Check if community exists
//     const community = await Community.findByPk(communityId);
//     if (!community) {
//       return res.status(404).json({ msg: 'Community not found' });
//     }

//     // Check if already favorited
//     const existingFavorite = await UserFavorite.findOne({
//       where: { userId, communityId }
//     });

//     if (existingFavorite) {
//       return res.status(400).json({ 
//         msg: 'Community is already in favorites' 
//       });
//     }

//     // Create favorite
//     const favorite = await UserFavorite.create({
//       userId,
//       communityId
//     });

//     return res.status(201).json({
//       msg: 'Community added to favorites successfully',
//       favorite
//     });

//   } catch (error) {
//     console.error('Error adding to favorites:', error);
//     return res.status(500).json({ 
//       msg: 'Failed to add community to favorites', 
//       error: error.message 
//     });
//   }
// };

// // Remove a community from user's favorites
// const removeFromFavorites = async (req, res) => {
//   try {
//     const { userId, communityId } = req.params;

//     // Find and delete the favorite
//     const favorite = await UserFavorite.findOne({
//       where: { userId, communityId }
//     });

//     if (!favorite) {
//       return res.status(404).json({ 
//         msg: 'Favorite not found' 
//       });
//     }

//     await favorite.destroy();

//     return res.status(200).json({
//       msg: 'Community removed from favorites successfully'
//     });

//   } catch (error) {
//     console.error('Error removing from favorites:', error);
//     return res.status(500).json({ 
//       msg: 'Failed to remove community from favorites', 
//       error: error.message 
//     });
//   }
// };

// // Get all favorites for a user
// const getUserFavorites = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, limit = 10 } = req.query;
//     const offset = (page - 1) * limit;

//     // Check if user exists
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     // Get user's favorites with community details
//     const { count, rows: favorites } = await UserFavorite.findAndCountAll({
//       where: { userId },
//       include: [{
//         model: Community,
//         as: 'community',
//         include: [{
//           model: Connector,
//           as: 'connectors'
//         }]
//       }],
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       order: [['createdAt', 'DESC']]
//     });

//     return res.status(200).json({
//       favorites,
//       totalPages: Math.ceil(count / limit),
//       currentPage: parseInt(page),
//       totalFavorites: count
//     });

//   } catch (error) {
//     console.error('Error fetching user favorites:', error);
//     return res.status(500).json({ 
//       msg: 'Failed to fetch user favorites', 
//       error: error.message 
//     });
//   }
// };

// // Check if a community is favorited by a user
// const checkIsFavorite = async (req, res) => {
//   try {
//     const { userId, communityId } = req.params;

//     const favorite = await UserFavorite.findOne({
//       where: { userId, communityId }
//     });

//     return res.status(200).json({
//       isFavorite: !!favorite
//     });

//   } catch (error) {
//     console.error('Error checking favorite status:', error);
//     return res.status(500).json({ 
//       msg: 'Failed to check favorite status', 
//       error: error.message 
//     });
//   }
// };

// // Get favorite count for a user
// const getFavoriteCount = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const count = await UserFavorite.count({
//       where: { userId }
//     });

//     return res.status(200).json({
//       count
//     });

//   } catch (error) {
//     console.error('Error getting favorite count:', error);
//     return res.status(500).json({ 
//       msg: 'Failed to get favorite count', 
//       error: error.message 
//     });
//   }
// };

// // Get most favorited communities (for analytics/trending)
// const getMostFavorited = async (req, res) => {
//   try {
//     const { limit = 10 } = req.query;

//     const favorites = await UserFavorite.findAll({
//       attributes: [
//         'communityId',
//         [db.sequelize.fn('COUNT', db.sequelize.col('communityId')), 'favoriteCount']
//       ],
//       include: [{
//         model: Community,
//         as: 'community',
//         include: [{
//           model: Connector,
//           as: 'connectors'
//         }]
//       }],
//       group: ['communityId', 'community.id', 'community->connectors.id'],
//       order: [[db.sequelize.fn('COUNT', db.sequelize.col('communityId')), 'DESC']],
//       limit: parseInt(limit)
//     });

//     return res.status(200).json({
//       mostFavorited: favorites
//     });

//   } catch (error) {
//     console.error('Error getting most favorited communities:', error);
//     return res.status(500).json({ 
//       msg: 'Failed to get most favorited communities', 
//       error: error.message 
//     });
//   }
// };

// module.exports = {
//   addToFavorites,
//   removeFromFavorites,
//   getUserFavorites,
//   checkIsFavorite,
//   getFavoriteCount,
//   getMostFavorited
// };





// controller/userFavorite.js - Enhanced to support both communities and connectors
const db = require('../models');
const { UserFavorite, User, Community, Connector } = db;
const { Op } = require('sequelize');

// Add a community to user's favorites
const addCommunityToFavorites = async (req, res) => {
  try {
    const { userId, communityId } = req.body;

    // Validate required fields
    if (!userId || !communityId) {
      return res.status(400).json({ 
        msg: 'User ID and Community ID are required' 
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }

    // Check if already favorited
    const existingFavorite = await UserFavorite.findOne({
      where: { userId, communityId, favoriteType: 'community' }
    });

    if (existingFavorite) {
      return res.status(400).json({ 
        msg: 'Community is already in favorites' 
      });
    }

    // Create favorite
    const favorite = await UserFavorite.create({
      userId,
      communityId,
      favoriteType: 'community'
    });

    return res.status(201).json({
      msg: 'Community added to favorites successfully',
      favorite
    });

  } catch (error) {
    console.error('Error adding community to favorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to add community to favorites', 
      error: error.message 
    });
  }
};

// Add a connector to user's favorites
const addConnectorToFavorites = async (req, res) => {
  try {
    const { userId, connectorId } = req.body;

    // Validate required fields
    if (!userId || !connectorId) {
      return res.status(400).json({ 
        msg: 'User ID and Connector ID are required' 
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if connector exists
    const connector = await Connector.findByPk(connectorId);
    if (!connector) {
      return res.status(404).json({ msg: 'Connector not found' });
    }

    // Check if already favorited
    const existingFavorite = await UserFavorite.findOne({
      where: { userId, connectorId, favoriteType: 'connector' }
    });

    if (existingFavorite) {
      return res.status(400).json({ 
        msg: 'Connector is already in favorites' 
      });
    }

    // Create favorite
    const favorite = await UserFavorite.create({
      userId,
      connectorId,
      favoriteType: 'connector'
    });

    return res.status(201).json({
      msg: 'Connector added to favorites successfully',
      favorite
    });

  } catch (error) {
    console.error('Error adding connector to favorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to add connector to favorites', 
      error: error.message 
    });
  }
};

// Generic add to favorites (can handle both community and connector)
const addToFavorites = async (req, res) => {
  try {
    const { userId, communityId, connectorId, favoriteType } = req.body;

    // Validate required fields
    if (!userId || !favoriteType) {
      return res.status(400).json({ 
        msg: 'User ID and favorite type are required' 
      });
    }

    if (!communityId && !connectorId) {
      return res.status(400).json({ 
        msg: 'Either Community ID or Connector ID is required' 
      });
    }

    if (communityId && connectorId) {
      return res.status(400).json({ 
        msg: 'Cannot add both community and connector in the same request' 
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let entityExists = false;
    let whereClause = { userId, favoriteType };

    if (favoriteType === 'community' && communityId) {
      const community = await Community.findByPk(communityId);
      if (!community) {
        return res.status(404).json({ msg: 'Community not found' });
      }
      whereClause.communityId = communityId;
      entityExists = true;
    } else if (favoriteType === 'connector' && connectorId) {
      const connector = await Connector.findByPk(connectorId);
      if (!connector) {
        return res.status(404).json({ msg: 'Connector not found' });
      }
      whereClause.connectorId = connectorId;
      entityExists = true;
    }

    if (!entityExists) {
      return res.status(400).json({ 
        msg: 'Invalid favorite type or missing entity ID' 
      });
    }

    // Check if already favorited
    const existingFavorite = await UserFavorite.findOne({ where: whereClause });

    if (existingFavorite) {
      return res.status(400).json({ 
        msg: `${favoriteType.charAt(0).toUpperCase() + favoriteType.slice(1)} is already in favorites` 
      });
    }

    // Create favorite
    const favoriteData = {
      userId,
      favoriteType
    };

    if (communityId) favoriteData.communityId = communityId;
    if (connectorId) favoriteData.connectorId = connectorId;

    const favorite = await UserFavorite.create(favoriteData);

    return res.status(201).json({
      msg: `${favoriteType.charAt(0).toUpperCase() + favoriteType.slice(1)} added to favorites successfully`,
      favorite
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to add to favorites', 
      error: error.message 
    });
  }
};

// Remove a community from user's favorites
const removeCommunityFromFavorites = async (req, res) => {
  try {
    const { userId, communityId } = req.params;

    // Find and delete the favorite
    const favorite = await UserFavorite.findOne({
      where: { userId, communityId, favoriteType: 'community' }
    });

    if (!favorite) {
      return res.status(404).json({ 
        msg: 'Community favorite not found' 
      });
    }

    await favorite.destroy();

    return res.status(200).json({
      msg: 'Community removed from favorites successfully'
    });

  } catch (error) {
    console.error('Error removing community from favorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to remove community from favorites', 
      error: error.message 
    });
  }
};

// Remove a connector from user's favorites
const removeConnectorFromFavorites = async (req, res) => {
  try {
    const { userId, connectorId } = req.params;

    // Find and delete the favorite
    const favorite = await UserFavorite.findOne({
      where: { userId, connectorId, favoriteType: 'connector' }
    });

    if (!favorite) {
      return res.status(404).json({ 
        msg: 'Connector favorite not found' 
      });
    }

    await favorite.destroy();

    return res.status(200).json({
      msg: 'Connector removed from favorites successfully'
    });

  } catch (error) {
    console.error('Error removing connector from favorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to remove connector from favorites', 
      error: error.message 
    });
  }
};

// Get all favorites for a user (both communities and connectors)
const getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Build where clause
    const whereClause = { userId };
    if (type && ['community', 'connector'].includes(type)) {
      whereClause.favoriteType = type;
    }

    // Get user's favorites with details
    const { count, rows: favorites } = await UserFavorite.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Community,
          as: 'community',
          required: false,
          include: [{
            model: Connector,
            as: 'connectors'
          }]
        },
        {
          model: Connector,
          as: 'connector',
          required: false,
          include: [{
            model: Community,
            as: 'community'
          }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      favorites,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalFavorites: count
    });

  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to fetch user favorites', 
      error: error.message 
    });
  }
};

// Check if a community is favorited by a user
const checkIsCommunityFavorite = async (req, res) => {
  try {
    const { userId, communityId } = req.params;

    const favorite = await UserFavorite.findOne({
      where: { userId, communityId, favoriteType: 'community' }
    });

    return res.status(200).json({
      isFavorite: !!favorite
    });

  } catch (error) {
    console.error('Error checking community favorite status:', error);
    return res.status(500).json({ 
      msg: 'Failed to check community favorite status', 
      error: error.message 
    });
  }
};

// Check if a connector is favorited by a user
const checkIsConnectorFavorite = async (req, res) => {
  try {
    const { userId, connectorId } = req.params;

    const favorite = await UserFavorite.findOne({
      where: { userId, connectorId, favoriteType: 'connector' }
    });

    return res.status(200).json({
      isFavorite: !!favorite
    });

  } catch (error) {
    console.error('Error checking connector favorite status:', error);
    return res.status(500).json({ 
      msg: 'Failed to check connector favorite status', 
      error: error.message 
    });
  }
};

// Get favorite count for a user (total or by type)
const getFavoriteCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    const whereClause = { userId };
    if (type && ['community', 'connector'].includes(type)) {
      whereClause.favoriteType = type;
    }

    const count = await UserFavorite.count({
      where: whereClause
    });

    const response = { count };
    
    if (!type) {
      // Also get counts by type
      const communityCount = await UserFavorite.count({
        where: { userId, favoriteType: 'community' }
      });
      const connectorCount = await UserFavorite.count({
        where: { userId, favoriteType: 'connector' }
      });
      
      response.breakdown = {
        communities: communityCount,
        connectors: connectorCount
      };
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error getting favorite count:', error);
    return res.status(500).json({ 
      msg: 'Failed to get favorite count', 
      error: error.message 
    });
  }
};

// Get most favorited communities
const getMostFavoritedCommunities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const favorites = await UserFavorite.findAll({
      where: { favoriteType: 'community' },
      attributes: [
        'communityId',
        [db.sequelize.fn('COUNT', db.sequelize.col('communityId')), 'favoriteCount']
      ],
      include: [{
        model: Community,
        as: 'community',
        include: [{
          model: Connector,
          as: 'connectors'
        }]
      }],
      group: ['communityId', 'community.id', 'community->connectors.id'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('communityId')), 'DESC']],
      limit: parseInt(limit)
    });

    return res.status(200).json({
      mostFavorited: favorites
    });

  } catch (error) {
    console.error('Error getting most favorited communities:', error);
    return res.status(500).json({ 
      msg: 'Failed to get most favorited communities', 
      error: error.message 
    });
  }
};

// Get most favorited connectors
const getMostFavoritedConnectors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const favorites = await UserFavorite.findAll({
      where: { favoriteType: 'connector' },
      attributes: [
        'connectorId',
        [db.sequelize.fn('COUNT', db.sequelize.col('connectorId')), 'favoriteCount']
      ],
      include: [{
        model: Connector,
        as: 'connector',
        include: [{
          model: Community,
          as: 'community'
        }]
      }],
      group: ['connectorId', 'connector.id', 'connector->community.id'],
      order: [[db.sequelize.fn('COUNT', db.sequelize.col('connectorId')), 'DESC']],
      limit: parseInt(limit)
    });

    return res.status(200).json({
      mostFavorited: favorites
    });

  } catch (error) {
    console.error('Error getting most favorited connectors:', error);
    return res.status(500).json({ 
      msg: 'Failed to get most favorited connectors', 
      error: error.message 
    });
  }
};

// Legacy function for backward compatibility
const removeFromFavorites = async (req, res) => {
  try {
    const { userId, communityId } = req.params;
    return await removeCommunityFromFavorites(req, res);
  } catch (error) {
    console.error('Error in legacy removeFromFavorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to remove from favorites', 
      error: error.message 
    });
  }
};

// Legacy function for backward compatibility
const checkIsFavorite = async (req, res) => {
  try {
    const { userId, communityId } = req.params;
    return await checkIsCommunityFavorite(req, res);
  } catch (error) {
    console.error('Error in legacy checkIsFavorite:', error);
    return res.status(500).json({ 
      msg: 'Failed to check favorite status', 
      error: error.message 
    });
  }
};

// Legacy function for backward compatibility
const getMostFavorited = async (req, res) => {
  try {
    return await getMostFavoritedCommunities(req, res);
  } catch (error) {
    console.error('Error in legacy getMostFavorited:', error);
    return res.status(500).json({ 
      msg: 'Failed to get most favorited', 
      error: error.message 
    });
  }
};

module.exports = {
  // New enhanced functions
  addToFavorites,
  addCommunityToFavorites,
  addConnectorToFavorites,
  removeCommunityFromFavorites,
  removeConnectorFromFavorites,
  getUserFavorites,
  checkIsCommunityFavorite,
  checkIsConnectorFavorite,
  getFavoriteCount,
  getMostFavoritedCommunities,
  getMostFavoritedConnectors,
  
  // Legacy functions for backward compatibility
  removeFromFavorites,
  checkIsFavorite,
  getMostFavorited
};