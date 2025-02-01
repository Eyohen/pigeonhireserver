const { Request, Response } = require("express");
const db = require("../models");
const { User, Review } = db;
const { Op } = require('sequelize');

// Calculate new average rating
const calculateNewRating = async (userId) => {
  const reviews = await Review.findAll({
    where: { userId }
  });

  if (!reviews.length) return 5; // Default rating if no reviews

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(1));
};

const create = async (req, res) => {
    try {
      const { userId } = req.params;  // ID of user being reviewed
      const { reviewerId, rating, comment } = req.body;  // Now getting reviewerId from body
  
      // Validate input
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating value' });
      }
  
      if (!reviewerId) {
        return res.status(400).json({ message: 'Reviewer ID is required' });
      }
  
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Prevent self-review
      if (userId === reviewerId) {
        return res.status(403).json({ message: 'You cannot review yourself' });
      }
  
      // Check for existing review
      const existingReview = await Review.findOne({
        where: {
          userId,
          reviewerId
        }
      });
  
      if (existingReview) {
        return res.status(403).json({ message: 'You have already reviewed this user' });
      }
  
      // Create the review
      const review = await Review.create({
        userId,
        reviewerId,
        rating,
        comment
      });
  
      // Update user's average rating
      const allReviews = await Review.findAll({
        where: { userId }
      });
  
      const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      await user.update({ rating: averageRating });
  
      // Fetch the created review with reviewer details
      const reviewWithDetails = await Review.findOne({
        where: { id: review.id },
        include: [{
          model: User,
          as: 'Reviewer',
          attributes: ['firstName', 'lastName']
        }]
      });
  
      return res.status(200).json({
        review: reviewWithDetails,
        message: "Review created successfully!"
      });
  
    } catch (error) {
      console.error("Error creating review:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };


  
const readall = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const reviews = await Review.findAndCountAll({
      limit,
      offset,
      include: [{
        model: User,
        as: 'Reviewer',
        attributes: ['firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      total: reviews.count,
      reviews: reviews.rows,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(reviews.count / limit)
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to fetch reviews", 
      error 
    });
  }
};

const readId = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'Reviewer',
        attributes: ['firstName', 'lastName']
      }]
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.json(review);
  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to fetch review", 
      error 
    });
  }
};

const readByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const reviews = await Review.findAndCountAll({
      where: { userId },
      limit,
      offset,
      include: [{
        model: User,
        as: 'Reviewer',
        attributes: ['firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      total: reviews.count,
      reviews: reviews.rows,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(reviews.count / limit)
    });
  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to fetch user reviews", 
      error 
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

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

    await review.update({ rating, comment });

    // Update user's average rating
    const newAverageRating = await calculateNewRating(review.userId);
    await User.update(
      { rating: newAverageRating },
      { where: { id: review.userId } }
    );

    const updatedReview = await Review.findOne({
      where: { id },
      include: [{
        model: User,
        as: 'Reviewer',
        attributes: ['firstName', 'lastName']
      }]
    });

    return res.json(updatedReview);
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error updating review', 
      error 
    });
  }
};

const deleteId = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.id;

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

    const userId = review.userId;
    await review.destroy();

    // Update user's average rating after deletion
    const newAverageRating = await calculateNewRating(userId);
    await User.update(
      { rating: newAverageRating },
      { where: { id: userId } }
    );

    return res.json({ 
      message: 'Review deleted successfully',
      deletedReview: review 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Error deleting review', 
      error 
    });
  }
};

module.exports = {
  create,
  readall,
  readId,
  update,
  deleteId,
  readByUserId
};