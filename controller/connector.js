const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Connector, Community } = db;
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
          firstName: {  // Changed from 'title' to 'name' to match the model
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

const countConnector = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const count = await Connector.count({
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

    const { count, rows: communities } = await Connector.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: `%${search}%`,
        },
        restrict: true, // This filters for restricted communities
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

const readId = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Connector.findOne({
      where: { id },
      include: [
        { model: Community, as: "community" }

      ],
    });
    return res.json(record);
  } catch (e) {
    return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
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

    const [updated] = await Connector.update(updateData, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedOwner = await Connector.findByPk(req.params.id);
      res.status(200).json(updatedOwner);
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

    const { count, rows: communities } = await Connector.findAndCountAll({
      where: {
        userId: userId,  // Filter by userId
        title: {
          [Op.iLike]: `%${search}%`,
        }
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [
        { model: Owner, as: "owner" },
        { model: User, as: "user" }
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
  countConnector,
  toggleRestrict,
  readRestrictedCommunities,
  readId,
  update,
  deleteId,
  readUserCommunities 
};
