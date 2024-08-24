const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Community, User } = db;
const { Op } = require('sequelize');

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


	const create = async (req, res) => {
		try {
			if (!req.body.user) {
				return res.status(404).json({ msg: "User not found" });
			}

			const { imageUrl } = req.body;
			// Check if image was uploaded
			let imageurl;
			if (req.file) {
				console.log(req.file);
				// Upload image to Cloudinary
				const uploadresult = await uploadtocloudinary(req.file.buffer);
				if (uploadresult.message === "error") {
					throw new Error(uploadresult.error.message);
				}
				imageurl = uploadresult.url;
			}

			// create menu record in the database
			const record = await Community.create({ ...req.body, imageUrl: imageurl });
			return res.status(200).json({ record, msg: "Successfully create Community" });
		} catch (error) {
			console.log("henry", error);
			return res.status(500).json({ msg: "fail to create", error });
		}
	}


	const readall = async (req, res) => {
		try {
			const { page = 1, limit = 10, search = ''} = req.query;
			const offset = (page - 1) * limit;

			const {count, rows: communities} = await Community.findAndCountAll({
				where: {
					name:{
						[Op.iLike]: `%${search}%`
					},
					restrict: false
				},
				limit: parseInt(limit),
				offset:parseInt(offset),
				order:[['createdAt', 'DESC']]
			});
			return res.json({
				communities,
				totalPages:Math.ceil(count / limit),
				currentPage: parseInt(page)
			});
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read" });
		}
	}

	const countCommunity = async (req, res) => {
		try {
			const { search = '' } = req.query;
	
			const count = await Community.count({
				where: {
					name: {
						[Op.iLike]: `%${search}%`
					},
					restrict: false
				}
			});
	
			return res.json({
				count: count,
				status: 200
			});
		} catch (e) {
			console.error("Error counting communities:", e);
			return res.status(500).json({ 
				msg: "Failed to count communities", 
				status: 500, 
				route: "/count" 
			});
		}
	};

	const toggleRestrict = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Community.findByPk(id);

			if(!record){
				return res.status(404).json({message:'Community not found'});
			}

			record.restrict = !record.restrict;
			await record.save();

			return res.status(200).json({message:'Community restricted', record});
		} catch (error) {
			return res.status(500).json({ message: "error restricting", status: 500, route: "/read/:id" });
		}
	}

	const readRestrictedCommunities = async (req, res) => {
		try {
			const { page = 1, limit = 10, search = '' } = req.query;
			const offset = (page - 1) * limit;
	
			const { count, rows: communities } = await Community.findAndCountAll({
				where: {
					name: {
						[Op.iLike]: `%${search}%`
					},
					restrict: true // This filters for restricted communities
				},
				limit: parseInt(limit),
				offset: parseInt(offset),
				order:[['createdAt', 'DESC']]
			});
	
			return res.json({
				communities,
				totalPages: Math.ceil(count / limit),
				currentPage: parseInt(page)
			});
		} catch (e) {
			console.error("Error fetching restricted communities:", e);
			return res.status(500).json({ 
				msg: "Failed to fetch restricted communities", 
				status: 500
			});
		}
	};

	const readId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Community.findOne({ where: { id } });
			return res.json(record);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
		}
	}

	const readByUserId = async (req, res) => {
		try {
			const { userId } = req.params;
			const communities = await Community.findAll({ where: { user: userId } });
			return res.json(communities);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/user/:userId" });
		}
	}

	const update = async (req, res) => {
		try {
			const {restrict, verified,name,description,communityType,commTypeCategory,location,size,communityInterest,interestCategory,engagementLevel,communicationPlatform,communicationCategory,
				connCategory,contentShared,communityGoal,accessType,prevCollabType,usp,recognition,additionalService,whatsapp,telegram,twitter, user
			 } = req.body;

			// Prepare update object with only the fields that should be updated
			const updateData = {};
			if (restrict !== undefined) updateData.restrict = restrict;
			if (verified !== undefined) updateData.verified = verified;
			if (name !== undefined) updateData.name = name;
			if (recognition!== undefined) updateData.description = description;
			if (communityType !== undefined) updateData.communityType = communityType;
			if (commTypeCategory !== undefined) updateData.commTypeCategory = commTypeCategory;
			if (location !== undefined) updateData.location = location;
			if (size !== undefined) updateData.size = size;
			if (communityInterest !== undefined) updateData.communityInterest = communityInterest;
			if (interestCategory !== undefined) updateData.interestCategory = interestCategory;
			if (engagementLevel !== undefined) updateData.engagementLevel = engagementLevel;
			if (communicationPlatform !== undefined) updateData.communicationPlatform = communicationPlatform;
			if (communicationCategory !== undefined) updateData.communicationCategory = communicationCategory;
			if (connCategory !== undefined) updateData.connCategory = connCategory;
			if (contentShared !== undefined) updateData.contentShared = contentShared;
			if (communityGoal !== undefined) updateData.communityGoal = communityGoal;
			if (accessType !== undefined) updateData.accessType = accessType;
			if (prevCollabType !== undefined) updateData.prevCollabType = prevCollabType;
			if (usp !== undefined) updateData.usp = usp;
			if (recognition!== undefined) updateData.recognition= description;
			if (additionalService !== undefined) updateData.additionalService = additionalService;
			if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
			if (telegram !== undefined) updateData.telegram = telegram;
			if (twitter !== undefined) updateData.twitter = twitter;
			if (user !== undefined) updateData.user = user;

			const [updated] = await Community.update(updateData, { where: { id: req.params.id } });
			if (updated) {
				const updatedCommunity = await Community.findByPk(req.params.id);
				res.status(200).json(updatedCommunity);
			} else {
				res.status(404).json({ message: 'Community not found' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error updating the Community', error });
		}
	}

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
	}


module.exports = {create, readall, countCommunity, toggleRestrict, readRestrictedCommunities, readId, update, deleteId, readByUserId};