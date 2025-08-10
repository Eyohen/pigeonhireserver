// community.js - with subscription protection
const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Community, Connector, ProfileView, UserAnalytics } = db;
const { Op } = require("sequelize");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const create = async (req, res) => {
  try {
    console.log("Received data:", req.body);
    console.log("Owner ID:", req.body.ownerId);

    // create community record in the database
    const record = await Community.create({ ...req.body});
    return res
      .status(200)
      .json({ record, msg: "Successfully created Community" });
  } catch (error) {
    console.error("Error in create:", error);
    return res.status(500).json({ msg: "fail to create", error });
  }
};

// Public endpoint - shows limited results for non-subscribers
const readall = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    // Check subscription status
    const hasSubscription = req.subscriptionStatus?.hasSubscription || false;
    
    // For non-subscribers, limit results and show only basic info
    const effectiveLimit = hasSubscription ? parseInt(limit) : Math.min(parseInt(limit), 5);
    
    const { count, rows: communities } = await Community.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: `%${search}%`,
        },
        restrict: false,
      },
      limit: effectiveLimit,
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Connector, as: "connectors" }
      ],
      // For non-subscribers, exclude sensitive information
      attributes: hasSubscription ? undefined : {
        exclude: ['email', 'whatsapp', 'telegram', 'twitter']
      }
    });

    const response = {
      communities,
      totalPages: Math.ceil(count / effectiveLimit),
      currentPage: parseInt(page),
      hasSubscription,
      isLimitedView: !hasSubscription
    };

    // Add subscription prompt for non-subscribers
    if (!hasSubscription) {
      response.subscriptionMessage = "Subscribe to view all communities and contact details";
      response.maxFreeResults = 5;
    }
    
    return res.json(response);
  } catch (error) {
    console.error("Error reading communities:", error);
    return res.status(500).json({ 
      msg: "Failed to read communities", 
      status: 500, 
      route: "/read",
      error: error.message
    });
  }
};

// Protected endpoint - requires active subscription for full details
const readId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check subscription status
    const hasSubscription = req.subscriptionStatus?.hasSubscription || false;
    
    // Find the community
    const record = await Community.findOne({
      where: { id },
      include: [
        { model: Connector, as: "connectors" }
      ],
      // For non-subscribers, exclude contact information
      attributes: hasSubscription ? undefined : {
        exclude: ['email', 'whatsapp', 'telegram', 'twitter']
      }
    });

    if (!record) {
      return res.status(404).json({ msg: "Community not found" });
    }

    // Track profile view if user is authenticated
    if (req.user) {
      try {
        // Check for duplicate view in the last hour
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        const recentView = await ProfileView.findOne({
          where: {
            userId: req.user.id,
            communityId: id,
            createdAt: { [Op.gte]: oneHourAgo }
          }
        });

        if (!recentView) {
          // Create profile view entry
          await ProfileView.create({
            userId: req.user.id,
            communityId: id,
            profileType: 'community',
            ipAddress: req.ip
          });

          // Update user analytics
          const analytics = await UserAnalytics.findOne({ where: { userId: req.user.id } });
          if (analytics) {
            analytics.profilesViewed += 1;
            analytics.lastUpdated = new Date();
            await analytics.save();
          } else {
            await UserAnalytics.create({
              userId: req.user.id,
              profilesViewed: 1
            });
          }
        }
      } catch (analyticsError) {
        console.error("Error tracking profile view:", analyticsError);
        // Continue without failing the main request
      }
    }

    const response = {
      ...record.toJSON(),
      hasSubscription,
      isLimitedView: !hasSubscription
    };

    // Add subscription prompt for non-subscribers
    if (!hasSubscription) {
      response.subscriptionMessage = "Subscribe to view contact details and connect with this community";
      response.hiddenFields = ['email', 'whatsapp', 'telegram', 'twitter'];
    }

    return res.json(response);
  } catch (e) {
    return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
  }
};

const countCommunity = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const count = await Community.count({
      where: {
        name: {
          [Op.iLike]: `%${search}%`,
        },
        restrict: false,
      },
    });

    return res.json({
      count: count,
      status: 200,
    });
  } catch (e) {
    console.error("Error counting communities:", e);
    return res.status(500).json({
      msg: "Failed to count communities",
      status: 500,
      route: "/count",
    });
  }
};

const toggleRestrict = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Community.findByPk(id);

    if (!record) {
      return res.status(404).json({ message: "Community not found" });
    }

    record.restrict = !record.restrict;
    await record.save();

    return res.status(200).json({ message: "Community restricted", record });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "error restricting", status: 500, route: "/read/:id" });
  }
};

const readRestrictedCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: communities } = await Community.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: `%${search}%`,
        },
        restrict: true,
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      communities,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (e) {
    console.error("Error fetching restricted communities:", e);
    return res.status(500).json({
      msg: "Failed to fetch restricted communities",
      status: 500,
    });
  }
};

const update = async (req, res) => {
  try {
    const {
      restrict,
      verified,
      name,
      description,
      email,
      review,
      rating,
      recognition,
      whatsapp,
      telegram,
      twitter,
      user,
    } = req.body;

    // Prepare update object with only the fields that should be updated
    const updateData = {};
    if (restrict !== undefined) updateData.restrict = restrict;
    if (verified !== undefined) updateData.verified = verified;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (review !== undefined) {
      if (!Array.isArray(review)) {
        return res.status(400).json({ message: "Review must be an array" });
      }
      updateData.review = review;
    }
    if (rating !== undefined) updateData.rating = rating;
    if (recognition !== undefined) updateData.recognition = recognition;
    if (description !== undefined) updateData.description = description;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (telegram !== undefined) updateData.telegram = telegram;
    if (twitter !== undefined) updateData.twitter = twitter;
    if (user !== undefined) updateData.user = user;

    const [updated] = await Community.update(updateData, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedOwner = await Community.findByPk(req.params.id);
      res.status(200).json(updatedOwner);
    } else {
      res.status(404).json({ message: "Community not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating the Community", error });
  }
};

const deleteId = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Community.findOne({ where: { id } });

    if (!record) {
      return res.json({ msg: "Can not find existing record" });
    }

    const deletedRecord = await record.destroy();
    return res.json({ record: deletedRecord });
  } catch (e) {
    return res.json({
      msg: "fail to read",
      status: 500,
      route: "/delete/:id",
    });
  }
};

const readUserCommunities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: communities } = await Community.findAndCountAll({
      where: {
        userId: userId,
        name: {
          [Op.iLike]: `%${search}%`,
        }
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Connector, as: "connectors" }
      ],
    });

    return res.json({
      communities,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (e) {
    console.error("Error fetching user communities:", e);
    return res.status(500).json({
      msg: "Failed to fetch user communities",
      status: 500,
      route: "/:userId/communities"
    });
  }
};

module.exports = {
  create,
  readall,
  countCommunity,
  toggleRestrict,
  readRestrictedCommunities,
  readId,
  update,
  deleteId,
  readUserCommunities 
};