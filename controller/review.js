const { Request, Response } = require("express");
const db = require("../models");
const { User, Review, Community } = db;
const { Op } = require('sequelize');

/**
 * Calculate average rating for a community
 */
const calculateCommunityRating = async (communityId) => {
  const reviews = await Review.findAll({
    where: { communityId }
  });

  if (!reviews.length) return 5; // Default rating if no reviews

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

/**
 * Create a review for a community
 */
// const createCommunityReview = async (req, res) => {
//   try {
//     const { communityId } = req.params;
//     const { rating, comment } = req.body;
//     const reviewerId = req.user.id; // Get from authenticated user

//     // Validate input
//     if (!rating || rating < 1 || rating > 5) {
//       return res.status(400).json({ message: 'Rating must be between 1 and 5' });
//     }

//     // Check if community exists
//     const community = await Community.findByPk(communityId);
//     if (!community) {
//       return res.status(404).json({ message: 'Community not found' });
//     }

//     // Prevent owner from reviewing their own community
//     if (community.ownerId === reviewerId || community.userId === reviewerId) {
//       return res.status(403).json({ message: 'You cannot review your own community' });
//     }

//     // Check for existing review
//     const existingReview = await Review.findOne({
//       where: {
//         communityId,
//         reviewerId
//       }
//     });

//     if (existingReview) {
//       return res.status(403).json({ message: 'You have already reviewed this community' });
//     }

//     // Create the review
//     const review = await Review.create({
//       communityId,
//       reviewerId,
//       rating,
//       comment,
//       reviewType: 'community'
//     });

//     // Update community's average rating
//     const newRating = await calculateCommunityRating(communityId);
//     await community.update({ rating: newRating });

//     // Fetch the created review with detailed information
//     const reviewWithDetails = await Review.findOne({
//       where: { id: review.id },
//       include: [
//         {
//           model: User,
//           as: 'Reviewer',
//           attributes: ['firstName', 'lastName']
//         },
//         {
//           model: Community,
//           as: 'Community',
//           attributes: ['name', 'communityType']
//         }
//       ]
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Review created successfully!",
//       review: reviewWithDetails
//     });
//   } catch (error) {
//     console.error("Error creating community review:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
const createCommunityReview = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { rating, comment, reviewerId } = req.body;
    
    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    if (!reviewerId) {
      return res.status(400).json({ message: 'reviewerId is required' });
    }
    
    if (!communityId) {
      return res.status(400).json({ message: 'communityId is required' });
    }
    
    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Prevent owner from reviewing their own community
    if (community.ownerId === reviewerId || community.userId === reviewerId) {
      return res.status(403).json({ message: 'You cannot review your own community' });
    }
    
    // Check for existing review
    const existingReview = await Review.findOne({
      where: {
        communityId,
        reviewerId
      }
    });
    
    if (existingReview) {
      return res.status(403).json({ message: 'You have already reviewed this community' });
    }
    
    // Create the review - explicitly set userId to null for community reviews
    const review = await Review.create({
      communityId,
      reviewerId,
      rating,
      comment,
      reviewType: 'community',
      userId: null  // Explicitly set to null for community reviews
    });
    
    // Update community's average rating
    const communityReviews = await Review.findAll({
      where: { communityId }
    });
    
    if (communityReviews.length > 0) {
      const totalRating = communityReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = parseFloat((totalRating / communityReviews.length).toFixed(1));
      
      // Add rating field to community if it doesn't exist
      await community.update({ rating: averageRating });
    }
    
    // Fetch the created review with reviewer details
    const reviewWithDetails = await Review.findOne({
      where: { id: review.id },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['firstName', 'lastName']
        },
        {
          model: Community,
          as: 'Community',
          attributes: ['name', 'communityType']
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: "Review created successfully!",
      review: reviewWithDetails
    });
  } catch (error) {
    console.error("Error creating community review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all reviews for a specific community
 */
const getCommunityReviews = async (req, res) => {
  try {
    const { communityId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const reviews = await Review.findAndCountAll({
      where: { communityId },
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
    console.error("Error fetching community reviews:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a review by its ID
 */
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['firstName', 'lastName', 'id']
        },
        {
          model: Community,
          as: 'Community',
          attributes: ['name', 'communityType', 'id']
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
 * Update a review
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Find the review
    const review = await Review.findOne({
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

    // If it's a community review, update the community's rating
    if (review.communityId) {
      const newRating = await calculateCommunityRating(review.communityId);
      await Community.update(
        { rating: newRating },
        { where: { id: review.communityId } }
      );
    }

    const updatedReview = await Review.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['firstName', 'lastName', 'id']
        },
        {
          model: Community,
          as: 'Community',
          attributes: ['name', 'communityType', 'id'],
          required: false
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
    const reviewerId = req.user.id;

    // Find the review
    const review = await Review.findOne({
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

    // Store communityId before deleting
    const { communityId } = review;

    // Delete the review
    await review.destroy();

    // If it was a community review, update the community's rating
    if (communityId) {
      const newRating = await calculateCommunityRating(communityId);
      await Community.update(
        { rating: newRating },
        { where: { id: communityId } }
      );
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

/**
 * Get the current user's review for a specific community
 */
const getUserCommunityReview = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: {
        communityId,
        reviewerId: userId
      },
      include: [
        {
          model: Community,
          as: 'Community',
          attributes: ['name', 'communityType', 'id']
        }
      ]
    });

    if (!review) {
      return res.status(404).json({ message: 'You have not reviewed this community yet' });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.error("Error fetching user's community review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createCommunityReview,
  getCommunityReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getUserCommunityReview
};