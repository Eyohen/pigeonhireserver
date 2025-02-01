const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Visible, User } = db;
const { Op } = require('sequelize');
const subPurchase = require("../models/subPurchase");

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


	const create = async (req, res) => {
		try {
			// if (!req.body.user) {
			// 	return res.status(404).json({ msg: "User not found" });
			// }

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
			const record = await Visible.create({ ...req.body, imageUrl: imageurl });
			return res.status(200).json({ record, msg: "Successfully create Visible" });
		} catch (error) {
			console.log("henry", error);
			return res.status(500).json({ msg: "fail to create", error });
		}
	}


	const adminReadall = async (req, res) => {
		try {
	
			const { page = 1, limit = 10, search = ''} = req.query;
			const offset = (page - 1) * limit;

			const {count, rows: communities} = await Visible.findAndCountAll({
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


	const readall = async (req, res) => {
		try {
		  const { page = 1, limit = 10, search = '' } = req.query;
		  const offset = (page - 1) * limit;
		  const hasActiveSubscription = req.hasActiveSubscription;
	  
		  let whereClause = {
			name: {
			  [Op.iLike]: `%${search}%`
			},
			restrict: false
		  };
	  
		  // Get total count (regardless of subscription status)
		  const totalCount = await Visible.count({ where: whereClause });
	  
		  // Determine which fields to return based on subscription status
		  const attributes = hasActiveSubscription 
			? undefined // All fields
			: ['name', 'description', 'communityType'];
	  
		  // Fetch communities
		  let { rows: communities } = await Visible.findAndCountAll({
			where: whereClause,
			limit: hasActiveSubscription ? parseInt(limit) : 2,
			offset: hasActiveSubscription ? parseInt(offset) : 0,
			order: [['createdAt', 'DESC']],
			attributes: attributes
		  });
	  
		  // If no active subscription, limit to 2 communities
		  if (!hasActiveSubscription && communities.length > 2) {
			communities = communities.slice(0, 2);
		  }
	  
		  return res.json({
			communities,
			totalPages: Math.ceil(totalCount / limit),
			currentPage: parseInt(page),
			totalCount: totalCount
		  });
		} catch (e) {
		  console.error("Error in readall:", e);
		  return res.status(500).json({ msg: "Failed to read communities", error: e.message });
		}
	  };

	const countVisible = async (req, res) => {
		try {
			const { search = '' } = req.query;
	
			const count = await Visible.count({
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
			
			});
		}
	};

	const toggleRestrict = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Visible.findByPk(id);

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
	
			const { count, rows: communities } = await Visible.findAndCountAll({
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
			const record = await Visible.findOne({ where: { id } });
			return res.json(record);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
		}
	}

	const update = async (req, res) => {
		try {
			// const { title, content } = req.body;
			const updated = await Visible.update({ ...req.body }, { where: { id: req.params.id } });
			if (updated) {
				const updatedVisible = await Visible.findByPk(req.params.id);
				res.status(200).json(updatedVisible);
			} else {
				res.status(404).json({ message: 'Visible not found' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error updating the Visible', error });
		}
	}

	const deleteId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Visible.findOne({ where: { id } });

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

	const getAllVisiblesByUserId = async (req, res) => {
		try {
			const { userId } = req.params;
			const { page = 1, limit = 10, search = '' } = req.query;
			const offset = (page - 1) * limit;
	
			console.log("Received userId:", userId); // Debug log
	
			if (!userId) {
				return res.status(400).json({ msg: "User ID is required" });
			}
	
			const { count, rows: visibles } = await Visible.findAndCountAll({
				where: { 
					user: userId,
					name: {
						[Op.iLike]: `%${search}%`
					}
				},
				limit: parseInt(limit),
				offset: parseInt(offset),
				order: [['createdAt', 'DESC']],
				include: [
					{
						model: db.User,
						attributes: ['id', 'email']
					}
				]
			});
	
			console.log("Found visibles:", visibles.length); // Debug log
	
			return res.status(200).json({
				visibles,
				totalPages: Math.ceil(count / limit),
				currentPage: parseInt(page)
			});
		} catch (error) {
			console.error("Error fetching visibles by user ID:", error);
			return res.status(500).json({ 
				msg: "Failed to fetch visibles by user ID", 
				error: error.message 
			});
		}
	};


module.exports = {create, readall, countVisible, toggleRestrict, readRestrictedCommunities, readId, update, deleteId, getAllVisiblesByUserId, adminReadall};