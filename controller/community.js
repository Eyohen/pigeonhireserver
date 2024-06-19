const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { Community, Payment, User } = db;

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
			const limit = req.query.limit || 10;
			const offset = req.query.offset;

			const records = await Community.findAll({
				// include:[{model:Payment, as: 'Payment'},{model:User, as: 'User'}]
			});
			return res.json(records);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read" });
		}
	}

	const readId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Community.findOne({ where: { id } });
			return res.json(record);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
		}
	}

	const update = async (req, res) => {
		try {
			// const { title, content } = req.body;
			const updated = await Community.update({ ...req.body }, { where: { id: req.params.id } });
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


module.exports = {create, readall, readId, update, deleteId};