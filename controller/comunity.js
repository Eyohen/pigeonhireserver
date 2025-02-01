const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Comunity, Owner, User } = db;
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


    // create menu record in the database
    const record = await Comunity.create({ ...req.body});
    return res
      .status(200)
      .json({ record, msg: "Successfully created Community" });
  } catch (error) {
    console.error("Error in create:", error);
    return res.status(500).json({ msg: "fail to create", error });
  }
};

const readall = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: communities } = await Comunity.findAndCountAll({
      where: {
        title: {
          [Op.iLike]: `%${search}%`,
        },
        restrict: false,
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
      include: [{ model: Owner, as: "owner" },{ model: User, as: "user" }],
    });
    return res.json({
      communities,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (e) {
    return res.json({ msg: "fail to read", status: 500, route: "/read" });
  }
};

const countCommunity = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const count = await Comunity.count({
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
    const record = await Comunity.findByPk(id);

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

    const { count, rows: communities } = await Comunity.findAndCountAll({
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
    const record = await Comunity.findOne({
      where: { id },
      include: [{ model: Owner, as: "owner" },{ model: User, as: "user" }],
    });
    return res.json(record);
  } catch (e) {
    return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
  }
};


// const readByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, limit = 10 } = req.query;
//     const offset = (page - 1) * limit;

//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ msg: "User not found" });
//     }

//     const queryOptions = {
//       where: { userId },
//       include: [{ model: Owner, as: "owner" }, { model: User, as: "user" }],
//       order: [["createdAt", "DESC"]]
//     };

//     if (!user.subscribed) {
//       queryOptions.limit = 3;
//     } else {
//       queryOptions.limit = parseInt(limit);
//       queryOptions.offset = parseInt(offset);
//     }

//     const { count, rows: communities } = await Comunity.findAndCountAll(queryOptions);

//     return res.json({
//       communities,
//       totalPages: Math.ceil(count / (user.subscribed ? limit : 3)),
//       currentPage: parseInt(page),
//       isSubscribed: user.subscribed
//     });
//   } catch (e) {
//     return res.status(500).json({ msg: "Failed to read communities", error: e.message });
//   }
// }

const readByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const queryOptions = {
      where: { userId },
      include: [{ model: Owner, as: "owner" }, { model: User, as: "user" }],
      order: [["createdAt", "DESC"]]
    };

    if (!user.subscribed) {
      queryOptions.limit = 3;
    } else {
      queryOptions.limit = parseInt(limit);
      queryOptions.offset = parseInt(offset);
    }

    const { count, rows: communities } = await Comunity.findAndCountAll(queryOptions);

    return res.json({
      communities,
      totalPages: Math.ceil(count / (user.subscribed ? limit : 3)),
      currentPage: parseInt(page),
      isSubscribed: user.subscribed
    });
  } catch (e) {
    return res.status(500).json({ msg: "Failed to read communities", error: e.message });
  }
}


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

    const [updated] = await Comunity.update(updateData, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedOwner = await Comunity.findByPk(req.params.id);
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
    const record = await Comunity.findOne({ where: { id } });

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


module.exports = {
  create,
  readall,
  countCommunity,
  toggleRestrict,
  readRestrictedCommunities,
  readId,
  update,
  deleteId,
  readByUserId,
};
