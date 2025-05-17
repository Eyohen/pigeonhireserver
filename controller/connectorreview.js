// controller/connectorReview.js
const { Request, Response } = require("express");
const db = require("../models");
const { User, Connector, ConnectorReview } = db;

/**
 * Calculate new average rating for a connector
 */
const calculateConnectorRating = async (connectorId) => {
  const reviews = await ConnectorReview.findAll({
    where: { connectorId }
  });

  if (!reviews.length) return 5; // Default rating if no reviews

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

/**
 * Create a review for a connector
 */
const createConnectorReview = async (req, res) => {
  try {
    const { connectorId } = req.params;
    const { rating, comment, reviewerId } = req.body;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }
    
    // Check if connector exists
    const connector = await Connector.findByPk(connectorId);
    if (!connector) {
      return res.status(404).json({ message: 'Connector not found' });
    }
    
    // Prevent self-review
    if (connector.id === reviewerId) {
      return res.status(403).json({ message: 'You cannot review yourself' });
    }
    
    // Check for existing review
    const existingReview = await ConnectorReview.findOne({
      where: {
        connectorId,
        reviewerId
      }
    });
    
    if (existingReview) {
      return res.status(403).json({ message: 'You have already reviewed this connector' });
    }
    
    // Create the review
    const review = await ConnectorReview.create({
      connectorId,
      reviewerId,
      rating,
      comment
    });
    
    // Update connector's average rating
    const newRating = await calculateConnectorRating(connectorId);
    
    // Check if rating field exists on Connector model, add it if needed
    if (connector.dataValues.hasOwnProperty('rating')) {
      await connector.update({ rating: newRating });
    } else {
      console.warn('Rating field not found on Connector model. Update may be needed.');
    }
    
    // Fetch the created review with details
    const reviewWithDetails = await ConnectorReview.findOne({
      where: { id: review.id },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['firstName', 'lastName']
        },
        {
          model: Connector,
          as: 'Connector',
          attributes: ['firstName', 'lastName', 'role']
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: "Review created successfully!",
      review: reviewWithDetails
    });
  } catch (error) {
    console.error("Error creating connector review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all reviews for a specific connector
 */
const getConnectorReviews = async (req, res) => {
  try {
    const { connectorId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Check if connector exists
    const connector = await Connector.findByPk(connectorId);
    if (!connector) {
      return res.status(404).json({ message: 'Connector not found' });
    }

    const reviews = await ConnectorReview.findAndCountAll({
      where: { connectorId },
      limit,
      offset,
      include: [{
        model: User,
        as: 'Reviewer',
        attributes: ['firstName', 'lastName', 'id']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      total: reviews.count,
      reviews: reviews.rows,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(reviews.count / limit)
    });
  } catch (error) {
    console.error("Error fetching connector reviews:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a single review by id
 */
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await ConnectorReview.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['firstName', 'lastName', 'id']
        },
        {
          model: Connector,
          as: 'Connector',
          attributes: ['firstName', 'lastName', 'role', 'id']
        }
      ]
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get current user's review for a connector
 */
const getUserConnectorReview = async (req, res) => {
  try {
    const { connectorId } = req.params;
    const { reviewerId } = req.query; // or from token: req.user.id

    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }

    const review = await ConnectorReview.findOne({
      where: {
        connectorId,
        reviewerId
      },
      include: [
        {
          model: Connector,
          as: 'Connector',
          attributes: ['firstName', 'lastName', 'role', 'id']
        }
      ]
    });

    if (!review) {
      return res.status(404).json({ message: 'You have not reviewed this connector yet' });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.error("Error fetching user's connector review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a review
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, reviewerId } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }

    // Find the review
    const review = await ConnectorReview.findOne({
      where: {
        id,
        reviewerId // Ensure only the reviewer can update their review
      }
    });

    if (!review) {
      return res.status(404).json({
        message: 'Review not found or you are not authorized to update this review'
      });
    }

    // Update the review
    await review.update({
      rating,
      comment
    });

    // Update connector's average rating
    const newRating = await calculateConnectorRating(review.connectorId);
    
    // Update the connector's rating
    const connector = await Connector.findByPk(review.connectorId);
    if (connector && connector.dataValues.hasOwnProperty('rating')) {
      await connector.update({ rating: newRating });
    }

    const updatedReview = await ConnectorReview.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['firstName', 'lastName', 'id']
        },
        {
          model: Connector,
          as: 'Connector',
          attributes: ['firstName', 'lastName', 'role', 'id']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully!",
      review: updatedReview
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a review
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewerId } = req.body; // or from token: req.user.id

    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }

    // Find the review
    const review = await ConnectorReview.findOne({
      where: {
        id,
        reviewerId // Ensure only the reviewer can delete their review
      }
    });

    if (!review) {
      return res.status(404).json({
        message: 'Review not found or you are not authorized to delete this review'
      });
    }

    const connectorId = review.connectorId;
    
    // Delete the review
    await review.destroy();

    // Update connector's average rating
    const newRating = await calculateConnectorRating(connectorId);
    
    // Update the connector's rating
    const connector = await Connector.findByPk(connectorId);
    if (connector && connector.dataValues.hasOwnProperty('rating')) {
      await connector.update({ rating: newRating });
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createConnectorReview,
  getConnectorReviews,
  getReviewById,
  getUserConnectorReview,
  updateReview,
  deleteReview
};