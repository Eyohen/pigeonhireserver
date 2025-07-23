// controller/analytics.js
const { Request, Response } = require("express");
const db = require("../models");
const { Op } = require("sequelize");
const { UserAnalytics, ContactLog, ProfileView, Lead, Network, User, Community, Connector } = db;

// Get user analytics dashboard
const getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get or create analytics record
    let analytics = await UserAnalytics.findOne({ where: { userId } });
    
    if (!analytics) {
      analytics = await UserAnalytics.create({ userId });
    }

    // Get recent activity counts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentContacts = await ContactLog.count({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    const recentViews = await ProfileView.count({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    const recentLeads = await Lead.count({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    const recentNetworks = await Network.count({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    return res.status(200).json({
      analytics,
      recentActivity: {
        contacts: recentContacts,
        views: recentViews,
        leads: recentLeads,
        networks: recentNetworks
      }
    });
    
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return res.status(500).json({ msg: "Failed to fetch analytics", error: error.message });
  }
};

// Record a contact action
const recordContact = async (req, res) => {
  try {
    const { userId, communityId, connectorId, contactType, contactMethod, message } = req.body;

    // Validate required fields
    if (!userId || !contactType || (!communityId && !connectorId)) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Create contact log entry
    const contactLog = await ContactLog.create({
      userId,
      communityId: contactType === 'community' ? communityId : null,
      connectorId: contactType === 'connector' ? connectorId : null,
      contactType,
      contactMethod,
      message
    });

    // Update user analytics
    const analytics = await UserAnalytics.findOne({ where: { userId } });
    if (analytics) {
      analytics.totalContacted += 1;
      analytics.lastUpdated = new Date();
      await analytics.save();
    } else {
      await UserAnalytics.create({
        userId,
        totalContacted: 1
      });
    }

    return res.status(201).json({
      contactLog,
      msg: "Contact recorded successfully"
    });

  } catch (error) {
    console.error("Error recording contact:", error);
    return res.status(500).json({ msg: "Failed to record contact", error: error.message });
  }
};

// Record a profile view
const recordProfileView = async (req, res) => {
  try {
    const { userId, communityId, connectorId, profileType, viewDuration } = req.body;
    const ipAddress = req.ip;

    // Validate required fields
    if (!userId || !profileType || (!communityId && !connectorId)) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Check for duplicate view in the last hour to avoid spam
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentView = await ProfileView.findOne({
      where: {
        userId,
        [profileType === 'community' ? 'communityId' : 'connectorId']: profileType === 'community' ? communityId : connectorId,
        createdAt: { [Op.gte]: oneHourAgo }
      }
    });

    if (recentView) {
      return res.status(200).json({ msg: "View already recorded recently" });
    }

    // Create profile view entry
    const profileView = await ProfileView.create({
      userId,
      communityId: profileType === 'community' ? communityId : null,
      connectorId: profileType === 'connector' ? connectorId : null,
      profileType,
      viewDuration,
      ipAddress
    });

    // Update user analytics
    const analytics = await UserAnalytics.findOne({ where: { userId } });
    if (analytics) {
      analytics.profilesViewed += 1;
      analytics.lastUpdated = new Date();
      await analytics.save();
    } else {
      await UserAnalytics.create({
        userId,
        profilesViewed: 1
      });
    }

    return res.status(201).json({
      profileView,
      msg: "Profile view recorded successfully"
    });

  } catch (error) {
    console.error("Error recording profile view:", error);
    return res.status(500).json({ msg: "Failed to record profile view", error: error.message });
  }
};

// Create a lead
const createLead = async (req, res) => {
  try {
    const { userId, communityId, connectorId, leadType, value, notes, followUpDate } = req.body;

    // Validate required fields
    if (!userId || !leadType || (!communityId && !connectorId)) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Create lead entry
    const lead = await Lead.create({
      userId,
      communityId: leadType === 'community' ? communityId : null,
      connectorId: leadType === 'connector' ? connectorId : null,
      leadType,
      value,
      notes,
      followUpDate
    });

    // Update user analytics
    const analytics = await UserAnalytics.findOne({ where: { userId } });
    if (analytics) {
      analytics.leads += 1;
      analytics.lastUpdated = new Date();
      await analytics.save();
    } else {
      await UserAnalytics.create({
        userId,
        leads: 1
      });
    }

    return res.status(201).json({
      lead,
      msg: "Lead created successfully"
    });

  } catch (error) {
    console.error("Error creating lead:", error);
    return res.status(500).json({ msg: "Failed to create lead", error: error.message });
  }
};

// Update lead status
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, value, notes, followUpDate } = req.body;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return res.status(404).json({ msg: "Lead not found" });
    }

    // Update lead
    const updateData = {};
    if (status) updateData.status = status;
    if (value !== undefined) updateData.value = value;
    if (notes) updateData.notes = notes;
    if (followUpDate) updateData.followUpDate = followUpDate;

    await lead.update(updateData);

    return res.status(200).json({
      lead,
      msg: "Lead updated successfully"
    });

  } catch (error) {
    console.error("Error updating lead:", error);
    return res.status(500).json({ msg: "Failed to update lead", error: error.message });
  }
};

// Create a network connection
const createNetwork = async (req, res) => {
  try {
    const { userId, communityId, connectorId, networkType, relationshipType, notes } = req.body;

    // Validate required fields
    if (!userId || !networkType || (!communityId && !connectorId)) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    // Check if network connection already exists
    const existingNetwork = await Network.findOne({
      where: {
        userId,
        [networkType === 'community' ? 'communityId' : 'connectorId']: networkType === 'community' ? communityId : connectorId
      }
    });

    if (existingNetwork) {
      return res.status(400).json({ msg: "Network connection already exists" });
    }

    // Create network entry
    const network = await Network.create({
      userId,
      communityId: networkType === 'community' ? communityId : null,
      connectorId: networkType === 'connector' ? connectorId : null,
      networkType,
      relationshipType,
      notes
    });

    // Update user analytics
    const analytics = await UserAnalytics.findOne({ where: { userId } });
    if (analytics) {
      analytics.networks += 1;
      analytics.lastUpdated = new Date();
      await analytics.save();
    } else {
      await UserAnalytics.create({
        userId,
        networks: 1
      });
    }

    return res.status(201).json({
      network,
      msg: "Network connection created successfully"
    });

  } catch (error) {
    console.error("Error creating network:", error);
    return res.status(500).json({ msg: "Failed to create network", error: error.message });
  }
};

// Update network status
const updateNetwork = async (req, res) => {
  try {
    const { id } = req.params;
    const { connectionStatus, relationshipType, notes } = req.body;

    const network = await Network.findByPk(id);
    if (!network) {
      return res.status(404).json({ msg: "Network connection not found" });
    }

    // Update network
    const updateData = {};
    if (connectionStatus) updateData.connectionStatus = connectionStatus;
    if (relationshipType) updateData.relationshipType = relationshipType;
    if (notes) updateData.notes = notes;

    await network.update(updateData);

    return res.status(200).json({
      network,
      msg: "Network connection updated successfully"
    });

  } catch (error) {
    console.error("Error updating network:", error);
    return res.status(500).json({ msg: "Failed to update network", error: error.message });
  }
};

// Get user's contacts
const getUserContacts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (status) whereClause.status = status;

    const { count, rows: contacts } = await ContactLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Community, as: "community", attributes: ['id', 'name', 'email'] },
        { model: Connector, as: "connector", attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    return res.status(200).json({
      contacts,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCount: count
    });

  } catch (error) {
    console.error("Error fetching user contacts:", error);
    return res.status(500).json({ msg: "Failed to fetch contacts", error: error.message });
  }
};

// Get user's leads
const getUserLeads = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (status) whereClause.status = status;

    const { count, rows: leads } = await Lead.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Community, as: "community", attributes: ['id', 'name', 'email'] },
        { model: Connector, as: "connector", attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    return res.status(200).json({
      leads,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCount: count
    });

  } catch (error) {
    console.error("Error fetching user leads:", error);
    return res.status(500).json({ msg: "Failed to fetch leads", error: error.message });
  }
};

// Get user's networks
const getUserNetworks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (status) whereClause.connectionStatus = status;

    const { count, rows: networks } = await Network.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Community, as: "community", attributes: ['id', 'name', 'email'] },
        { model: Connector, as: "connector", attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    return res.status(200).json({
      networks,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCount: count
    });

  } catch (error) {
    console.error("Error fetching user networks:", error);
    return res.status(500).json({ msg: "Failed to fetch networks", error: error.message });
  }
};

module.exports = {
  getUserAnalytics,
  recordContact,
  recordProfileView,
  createLead,
  updateLead,
  createNetwork,
  updateNetwork,
  getUserContacts,
  getUserLeads,
  getUserNetworks
};