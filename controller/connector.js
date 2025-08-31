//connector.js - Controller with analytics tracking
const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Connector, Community, ProfileView, UserAnalytics } = db;
const { Op } = require("sequelize");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const create = async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const community = await Community.findOne({
        where: {name: req.body.communityName}
    }) 

    if (!community && req.body.communityName){
        return res.status(404).json({msg:"Community not found"});
    }

    // create connector record in the database
    const record = await Connector.create({ ...req.body});
    return res
      .status(200)
      .json({ record, msg: "Successfully created Connector" });
  } catch (error) {
    console.error("Error in create:", error);
    return res.status(500).json({ msg: "fail to create", error });
  }
};

const readall = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: connectors } = await Connector.findAndCountAll({
      where: {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
        restrict: false,
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Community, as: "community" }
      ],
    });
    
    return res.json({
      connectors,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error reading connectors:", error);
    return res.status(500).json({ 
      msg: "Failed to read connectors", 
      status: 500, 
      route: "/read",
      error: error.message
    });
  }
};

const readId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the connector
    const record = await Connector.findOne({
      where: { id },
      include: [
        { model: Community, as: "community" }
      ],
    });

    if (!record) {
      return res.status(404).json({ msg: "Connector not found" });
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
            connectorId: id,
            createdAt: { [Op.gte]: oneHourAgo }
          }
        });

        if (!recentView) {
          // Create profile view entry
          await ProfileView.create({
            userId: req.user.id,
            connectorId: id,
            profileType: 'connector',
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

    return res.json(record);
  } catch (e) {
    return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
  }
};

const countConnector = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const count = await Connector.count({
      where: {
        firstName: {
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
    console.error("Error counting connectors:", e);
    return res.status(500).json({
      msg: "Failed to count connectors",
      status: 500,
      route: "/count",
    });
  }
};

const toggleRestrict = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Connector.findByPk(id);

    if (!record) {
      return res.status(404).json({ message: "Connector not found" });
    }

    record.restrict = !record.restrict;
    await record.save();

    return res.status(200).json({ message: "Connector restricted", record });
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

    const { count, rows: connectors } = await Connector.findAndCountAll({
      where: {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
        restrict: true,
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      connectors,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (e) {
    console.error("Error fetching restricted connectors:", e);
    return res.status(500).json({
      msg: "Failed to fetch restricted connectors",
      status: 500,
    });
  }
};

const update = async (req, res) => {
  try {
    const {
      restrict,
      verified,
      firstName,
      lastName,
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
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
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

    const [updated] = await Connector.update(updateData, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedConnector = await Connector.findByPk(req.params.id);
      res.status(200).json(updatedConnector);
    } else {
      res.status(404).json({ message: "Connector not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating the Connector", error });
  }
};

const deleteId = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Connector.findOne({ where: { id } });

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

    const { count, rows: connectors } = await Connector.findAndCountAll({
      where: {
        userId: userId,
        firstName: {
          [Op.iLike]: `%${search}%`,
        }
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Community, as: "community" }
      ],
    });

    return res.json({
      connectors,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (e) {
    console.error("Error fetching user connectors:", e);
    return res.status(500).json({
      msg: "Failed to fetch user connectors",
      status: 500,
      route: "/:userId/communities"
    });
  }
};



// Admin-specific connector creation
const adminCreateConnector = async (req, res) => {
  try {
    console.log("Admin creating connector:", req.body);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      description,
      communityName,
      website,
      linkedIn,
      whatsapp,
      telegram,
      twitter,
      instagram,
      accessRequirement,
      connectionType,
      connectionPlatform,
      sourceOfInfo,
      // Admin can set verification status
      verified = false,
      // Admin sets userId as null or assigns to a specific user
      userId = null
    } = req.body;

    // If communityName is provided, verify it exists
    if (communityName) {
      const community = await Community.findOne({ where: { name: communityName } });
      if (!community) {
        return res.status(404).json({ msg: "Community not found" });
      }
    }

    // Create connector record
    const record = await Connector.create({
      firstName,
      lastName,
      email,
      phone: phone || null,
      role,
      description: description || null,
      communityName: communityName || null,
      website: website || '',
      linkedIn: linkedIn || null,
      whatsapp: whatsapp || null,
      telegram: telegram || null,
      twitter: twitter || null,
      instagram: instagram || null,
      accessRequirement: accessRequirement || 'Open Access',
      connectionType: connectionType || 'Professional',
      connectionPlatform: connectionPlatform || 'Email',
      sourceOfInfo: sourceOfInfo || 'Admin Created',
      verified,
      restrict: false, // Admin created connectors are not restricted by default
      subscribed: false,
      userId
    });

    return res.status(201).json({ 
      record, 
      msg: "Connector created successfully by admin" 
    });
  } catch (error) {
    console.error("Error in admin connector creation:", error);
    return res.status(500).json({ 
      msg: "Failed to create connector", 
      error: error.message 
    });
  }
};


module.exports = {
  create,
  readall,
  countConnector,
  toggleRestrict,
  readRestrictedCommunities,
  readId,
  update,
  deleteId,
  readUserCommunities,
  adminCreateConnector
};
