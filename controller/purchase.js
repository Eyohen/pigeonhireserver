const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const {Op} = require('sequelize')
const db = require("../models");
const {Purchase} = db;
const sendEmail = require('../utils/sendEmail.js')



	const create = async (req, res) => {
		try {
			const {purchases} = req.body;
			console.log("purchases",purchases)
			
			if (!Array.isArray(purchases)) {
				return res.status(400).json({ msg: "Invalid input. Expected an array of purchases." });
			}
	
			const createdPurchases = await Purchase.bulkCreate(purchases)
			console.log("created purchases",createdPurchases)

	let errorArray = [];
			for (const purchase of createdPurchases) {
				try {
					await sendEmail(
						"hello@pigeonhire.com",
						purchase.email,
						"Order Confirmation",
						"Order Confirmation!",
						purchase.firstName,
						purchase.communityName,
						purchase.title,
						purchase.currency,
						purchase.amount,
					
					);
				} catch (emailError) {
					console.error("Failed to send email for purchase:", purchase.id, emailError);
					errorArray.push[emailError]
					// Consider how you want to handle email sending failures
					// You might want to log this or retry later
				}
			}
			
			return res.status(200).json({ 
				records: createdPurchases, 
				msg: "Purchases Successfully Created!" 
			});
		} catch (error) {
			console.log("Error in purchase creation:", error);
			return res.status(500).json({ msg: "Failed to create purchases", error: error.message });
		}
	}

	
	const readall = async (req, res) => {
		try {
			const limit = req.query.limit || 10;
			const offset = req.query.offset;

			const records = await Purchase.findAll({});
			return res.json(records);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read" });
		}
	}


	const readId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Purchase.findOne({ where: { id } });
			return res.json(record);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
		}
	}

	const readByCollaborationType = async (req, res) => {
		try {
			const { collaborationTypeId } = req.params;
			const purchases = await Purchase.findAll({ 
				where: { collaborationTypeId: collaborationTypeId },
				include: [
					{ model: User, attributes: ['id', 'username', 'email'] },
					{ model: Community, as: 'community', attributes: ['id', 'name'] },
					{ model: CollaborationType, as: 'collaborationType', attributes: ['id', 'title'] }
				]
			});
			
			if (purchases.length === 0) {
				return res.status(404).json({ msg: "No purchases found for this collaboration type" });
			}
			
			return res.status(200).json(purchases);
		} catch (error) {
			console.error("Error fetching purchases by collaboration type:", error);
			return res.status(500).json({ 
				msg: "Failed to fetch purchases by collaboration type", 
				error: error.message 
			});
		}
	}

	const update = async (req, res) => {
        try {
            // const { title, content } = req.body;
            const updated = await Purchase.update({...req.body}, { where: { id: req.params.id } });
            if (updated) {
                const updatedPurchase = await Purchase.findByPk(req.params.id);
                res.status(200).json(updatedPurchase);
            } else {
                res.status(404).json({ message: 'Purchase not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating the Purchase', error });
        }
    }


	const deleteId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Purchase.findOne({ where: { id } });

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

	const readByUserId = async (req, res) => {
		try {
			const { userId } = req.params;
			console.log("Received userId:", userId); // Debug log
	
			if (!userId) {
				return res.status(400).json({ msg: "User ID is required" });
			}
	
			const purchases = await Purchase.findAll({
				where: { userId: userId },
				include: [
					{ 
						model: db.User,
						attributes: ['id', 'email']
					},
					{ 
						model: db.Community,
						as: 'community',
						attributes: ['id', 'name']
					},
					{ 
						model: db.CollaborationType,
						as: 'collaborationType',
						attributes: ['id', 'title']
					}
				]
			});
	
			console.log("Found purchases:", purchases.length); // Debug log
	
			if (purchases.length === 0) {
				return res.status(404).json({ msg: "No purchases found for this user" });
			}
	
			return res.status(200).json(purchases);
		} catch (error) {
			console.error("Error fetching purchases by user ID:", error);
			return res.status(500).json({ 
				msg: "Failed to fetch purchases by user ID", 
				error: error.message 
			});
		}
	}


	const countTotalPurchases = async (req, res) => {
		console.log("countTotalPurchases function called");
		console.log("Request URL:", req.originalUrl);
		console.log("Request method:", req.method);
		console.log("Request params:", req.params);
		console.log("Request query:", req.query);
	  
		try {
		  console.log("Attempting to count purchases...");
		  const { count } = await Purchase.findAndCountAll();
		  console.log(`Total purchases count: ${count}`);
	  
		  return res.status(200).json({
			totalPurchases: count,
			msg: "Successfully retrieved total purchase count"
		  });
		} catch (error) {
		  console.error("Error in countTotalPurchases:", error);
		  console.error("Error stack:", error.stack);
		  return res.status(500).json({ 
			msg: "Failed to count purchases", 
			error: error.message,
			stack: error.stack,
			// Include these for debugging
			url: req.originalUrl,
			method: req.method
		  });
		}
	  };



	  // Optional: Add a function to count purchases with filters
	  const countPurchasesWithFilters = async (req, res) => {
		console.log("countPurchasesWithFilters function called");
		console.log("Request query parameters:", req.query);
	  
		const { userId, communityId, collaborationTypeId } = req.query;
		
		try {
		  console.log("Preparing where clause...");
		  let whereClause = {};
		  if (userId) whereClause.userId = userId;
		  if (communityId) whereClause.communityId = communityId;
		  if (collaborationTypeId) whereClause.collaborationTypeId = collaborationTypeId;
		  console.log("Where clause:", whereClause);
	  
		  console.log("Attempting to count purchases with filters...");
		  const count = await Purchase.count({ where: whereClause });
		  console.log(`Filtered purchases count: ${count}`);
	  
		  console.log("Preparing response...");
		  const response = {
			totalPurchases: count,
			msg: "Successfully retrieved filtered purchase count",
			filters: { userId, communityId, collaborationTypeId }
		  };
		  console.log("Response object:", response);
	  
		  console.log("Sending response...");
		  return res.status(200).json(response);
		} catch (error) {
		  console.error("Error in countPurchasesWithFilters:", error);
		  console.error("Error stack:", error.stack);
		  return res.status(500).json({ 
			msg: "Failed to count purchases with filters", 
			error: error.message,
			stack: error.stack
		  });
		} finally {
		  console.log("countPurchasesWithFilters function completed");
		}
	  };
	  

	  const getTotalAmountByCurrency = async (req, res) => {
		console.log("getTotalAmountByCurrency function called");
		console.log("Request params:", req.params);
	  
		const { currency } = req.params;
	  
		if (!currency) {
		  return res.status(400).json({ msg: "Currency parameter is required" });
		}
	  
		try {
		  console.log(`Attempting to sum purchases for currency: ${currency}`);
		  const result = await Purchase.sum('amount', {
			where: { currency: currency }
		  });
	  
		  console.log(`Total amount for ${currency}: ${result}`);
	  
		  if (result === null) {
			return res.status(404).json({
			  msg: `No purchases found for currency: ${currency}`,
			  totalAmount: 0
			});
		  }
	  
		  return res.status(200).json({
			currency: currency,
			totalAmount: result,
			msg: `Successfully retrieved total amount for ${currency}`
		  });
		} catch (error) {
		  console.error("Error in getTotalAmountByCurrency:", error);
		  return res.status(500).json({ 
			msg: "Failed to calculate total amount", 
			error: error.message
		  });
		}
	  };
	  


module.exports = {create, readall, readId, readByUserId, update, deleteId, readByCollaborationType, countTotalPurchases, countPurchasesWithFilters, getTotalAmountByCurrency};