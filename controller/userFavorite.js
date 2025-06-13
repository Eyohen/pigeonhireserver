const db = require('../models');
const { UserFavorite, User, Community, Connector } = db;
const { Op } = require('sequelize');

// Add a community to user's favorites
const addToFavorites = async (req, res) => {
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
      where: { userId, communityId }
    });

    if (existingFavorite) {
      return res.status(400).json({ 
        msg: 'Community is already in favorites' 
      });
    }

    // Create favorite
    const favorite = await UserFavorite.create({
      userId,
      communityId
    });

    return res.status(201).json({
      msg: 'Community added to favorites successfully',
      favorite
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to add community to favorites', 
      error: error.message 
    });
  }
};

// Remove a community from user's favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { userId, communityId } = req.params;

    // Find and delete the favorite
    const favorite = await UserFavorite.findOne({
      where: { userId, communityId }
    });

    if (!favorite) {
      return res.status(404).json({ 
        msg: 'Favorite not found' 
      });
    }

    await favorite.destroy();

    return res.status(200).json({
      msg: 'Community removed from favorites successfully'
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return res.status(500).json({ 
      msg: 'Failed to remove community from favorites', 
      error: error.message 
    });
  }
};

// Get all favorites for a user
const getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get user's favorites with community details
    const { count, rows: favorites } = await UserFavorite.findAndCountAll({
      where: { userId },
      include: [{
        model: Community,
        as: 'community',
        include: [{
          model: Connector,
          as: 'connectors'
        }]
      }],
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
const checkIsFavorite = async (req, res) => {
  try {
    const { userId, communityId } = req.params;

    const favorite = await UserFavorite.findOne({
      where: { userId, communityId }
    });

    return res.status(200).json({
      isFavorite: !!favorite
    });

  } catch (error) {
    console.error('Error checking favorite status:', error);
    return res.status(500).json({ 
      msg: 'Failed to check favorite status', 
      error: error.message 
    });
  }
};

// Get favorite count for a user
const getFavoriteCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await UserFavorite.count({
      where: { userId }
    });

    return res.status(200).json({
      count
    });

  } catch (error) {
    console.error('Error getting favorite count:', error);
    return res.status(500).json({ 
      msg: 'Failed to get favorite count', 
      error: error.message 
    });
  }
};

// Get most favorited communities (for analytics/trending)
const getMostFavorited = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const favorites = await UserFavorite.findAll({
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

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  checkIsFavorite,
  getFavoriteCount,
  getMostFavorited
};