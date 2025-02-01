const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { SubPurchase, User, Product } = db;
const { Op } = require("sequelize");
const sendSubscriptionEmail = require("../utils/sendSubscriptionEmail.js");
const threeDaysEmail = require("../utils/threeDaysEmail.js");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const create = async (req, res) => {
  try {

    const { email, firstName, userId, amount, currency, type } = req.body;

    // Calculate endDate based on subscription type
    let endDate = new Date();
    switch (type) {
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "annual":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ msg: "Invalid subscription type" });
    }

    // create SubPurchase record in the database
    const record = await SubPurchase.create({
      email: req.body.email,
      firstName,
      userId,
      amount,
      currency,
      type,
      endDate,
      ...req.body,
    });

    await sendSubscriptionEmail(
      "hello@pigeonhire.com",
      record.email,
      "Subscription Order",
      "Order Confirmed!",
      record.firstName,
      record.type,
      record.amount,
      record.currency,
      record.createdAt,
      record.endDate
    );

    // Schedule the three-day reminder email
    const reminderDate = new Date(endDate.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days before endDate
    scheduleReminderEmail(record, reminderDate);

    return res
      .status(200)
      .json({
        record,
        msg: "Successfully create SubPurchase, check your email to see your receipt",
      });
  } catch (error) {
    console.log("henry", error);
    return res.status(500).json({ msg: "fail to create", error });
  }
};

// Function to schedule the reminder email
const scheduleReminderEmail = (record, reminderDate) => {
	const now = new Date();
	const delay = reminderDate.getTime() - now.getTime();
	
	if (delay > 0) {
	  setTimeout(async () => {
		await threeDaysEmail(
		  "hello@pigeonhire.com",
		  record.email,
		  "Notice Order",
		  "Subscription Expiring Soon!",
		  record.firstName,
		  record.type,
		  record.endDate
		);
	  }, delay);
	}
  }

const readall = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const offset = req.query.offset;

    const records = await SubPurchase.findAll({
      // include:[{model:Payment, as: 'Payment'},{model:User, as: 'User'}]
    });
    return res.json(records);
  } catch (e) {
    return res.json({ msg: "fail to read", status: 500, route: "/read" });
  }
};

const readId = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await SubPurchase.findOne({ where: { id } });
    return res.json(record);
  } catch (e) {
    return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
  }
};

const readByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const communities = await SubPurchase.findAll({ where: { user: userId } });
    return res.json(communities);
  } catch (e) {
    return res.json({
      msg: "fail to read",
      status: 500,
      route: "/read/user/:userId",
    });
  }
};

const update = async (req, res) => {
  try {
    // const { title, content } = req.body;
    const updated = await SubPurchase.update(
      { ...req.body },
      { where: { id: req.params.id } }
    );
    if (updated) {
      const updatedSubPurchase = await SubPurchase.findByPk(req.params.id);
      res.status(200).json(updatedSubPurchase);
    } else {
      res.status(404).json({ message: "SubPurchase not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating the SubPurchase", error });
  }
};

const deleteId = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await SubPurchase.findOne({ where: { id } });

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


const getCurrentSubscription = async (req, res) => {
	console.log("getCurrentSubscription function called");
	try {
	  console.log("Received request params:", req.params);
	  
	  const userId = req.params.id;  // Changed from req.params.userId to req.params.id
	  console.log("Received userId:", userId);
  
	  if (!userId || userId === 'undefined') {
		console.log("userId is invalid:", userId);
		return res.status(400).json({ msg: "User ID is required" });
	  }
  
	  const currentDate = new Date();
	  console.log("Current date:", currentDate);
  
	  console.log("Attempting to find subscription for userId:", userId);
	  const currentSubscription = await SubPurchase.findOne({
		where: {
		  userId: {
			[Op.eq]: userId
		  },
		  endDate: {
			[Op.gt]: currentDate
		  }
		},
		order: [['endDate', 'DESC']],
		logging: console.log // This will log the generated SQL
	  });
  
	  console.log("Query result:", currentSubscription);
  
	  if (!currentSubscription) {
		console.log("No active subscription found for user:", userId);
		return res.status(404).json({ msg: "No active subscription found for this user" });
	  }
  
	  console.log("Active subscription found:", currentSubscription.id);
	  return res.status(200).json({
		subscription: currentSubscription,
		msg: "Current active subscription retrieved successfully"
	  });
  
	} catch (error) {
	  console.error("Error retrieving current subscription:", error);
	  return res.status(500).json({ msg: "Failed to retrieve current subscription", error: error.message });
	}
  }

  const checkActiveSubscription = async (req, res, next) => {
    try {
      const userId = req.query.userId; // Get userId from query parameters
      if (!userId) {
        return res.status(400).json({ msg: "User ID is required" });
      }
  
      const currentDate = new Date();
      const activeSubscription = await SubPurchase.findOne({
        where: {
          userId: userId,
          endDate: {
            [Op.gt]: currentDate
          }
        }
      });
  
      req.hasActiveSubscription = !!activeSubscription;
      next();
    } catch (error) {
      console.error("Error checking active subscription:", error);
      res.status(500).json({ msg: "Failed to check subscription status", error: error.message });
    }
  };
  

  const countTotalSubscriptions = async (req, res) => {
    try {
      const count = await SubPurchase.count();
      
      return res.status(200).json({
        totalSubscriptions: count,
        msg: "Successfully retrieved total subscription count"
      });
    } catch (error) {
      console.error("Error counting total subscriptions:", error);
      return res.status(500).json({ 
        msg: "Failed to count total subscriptions", 
        error: error.message 
      });
    }
  };

  const countActiveSubscriptions = async (req, res) => {
    try {
      const currentDate = new Date();
      const count = await SubPurchase.count({
        where: {
          endDate: {
            [Op.gt]: currentDate
          }
        }
      });
      
      return res.status(200).json({
        activeSubscriptions: count,
        msg: "Successfully retrieved active subscription count"
      });
    } catch (error) {
      console.error("Error counting active subscriptions:", error);
      return res.status(500).json({ 
        msg: "Failed to count active subscriptions", 
        error: error.message 
      });
    }
  };


  const upgradeSubscription = async (req, res) => {
    console.log("Upgrade subscription function called");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
  
    try {
      const { id } = req.params;
      const { newPlanType, newAmount } = req.body;  // Renamed amount to newAmount for clarity
  
      console.log(`Attempting to upgrade subscription for user: ${id}`);
      console.log(`New plan type: ${newPlanType}, New Amount: ${newAmount}`);
  
      // Get the current subscription
      const currentSubscription = await SubPurchase.findOne({
        where: { userId: id, endDate: { [Op.gt]: new Date() } },
        order: [['endDate', 'DESC']]
      });
  
      if (!currentSubscription) {
        return res.status(404).json({ msg: "No active subscription found" });
      }
  
      const now = new Date();
      const currentEndDate = new Date(currentSubscription.endDate);
      const currentStartDate = new Date(currentSubscription.createdAt);
      
      // Calculate the total days in the current subscription
      const totalDaysInCurrentSub = (currentEndDate - currentStartDate) / (1000 * 60 * 60 * 24);
      
      // Calculate the used days in the current subscription
      const usedDays = (now - currentStartDate) / (1000 * 60 * 60 * 24);
      
      // Calculate the unused days in the current subscription
      const unusedDays = totalDaysInCurrentSub - usedDays;
      
      // Calculate the daily rate of the current subscription
      const currentDailyRate = currentSubscription.amount / totalDaysInCurrentSub;
      
      // Calculate the value of the unused portion
      const unusedValue = currentDailyRate * unusedDays;
  
      // Calculate the new end date based on the new plan type
      const newEndDate = calculateNewEndDate(newPlanType, now);
  
      // Calculate the prorated amount for the new subscription
      const daysInNewPlan = (newEndDate - now) / (1000 * 60 * 60 * 24);
      const newDailyRate = parseFloat(newAmount) / getDaysInSubscription(newPlanType);
      const proratedNewAmount = newDailyRate * daysInNewPlan;
  
      // Calculate the amount to charge (prorated new amount minus unused value of current subscription)
      const amountToCharge = proratedNewAmount - unusedValue;
  
      // Update the subscription
      const [updatedCount, updatedSubscriptions] = await SubPurchase.update({
        type: newPlanType,
        amount: proratedNewAmount,
        endDate: newEndDate
      }, {
        where: { id: currentSubscription.id },
        returning: true
      });
  
      if (updatedCount === 0) {
        return res.status(500).json({ msg: "Failed to update subscription" });
      }
  
      console.log("Upgrade successful");
      return res.status(200).json({
        msg: "Subscription upgraded successfully",
        subscription: updatedSubscriptions[0],
        amountCharged: amountToCharge,
        newEndDate: newEndDate
      });
  
    } catch (error) {
      console.error("Error in upgradeSubscription:", error);
      return res.status(500).json({ msg: "Failed to upgrade subscription", error: error.message });
    }
  };
  
  // Helper function to get the number of days in a subscription period
  const getDaysInSubscription = (type) => {
    switch (type) {
      case "monthly": return 30;
      case "quarterly": return 90;
      case "annually": return 365;
      default: return 0;
    }
  };
  
  // Helper function to calculate the new end date
  const calculateNewEndDate = (newPlanType, startDate) => {
    const date = new Date(startDate);
    switch (newPlanType) {
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "annually":
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  };

module.exports = { create, readall, readId, update, deleteId, readByUserId, getCurrentSubscription , checkActiveSubscription, countActiveSubscriptions, countTotalSubscriptions, upgradeSubscription};
