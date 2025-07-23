const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models');
const { Subscription, User, Currency } = db;
const { Op } = require('sequelize');

// Helper function to calculate end date based on plan type
const calculateEndDate = (startDate, planType) => {
  const start = new Date(startDate);
  let endDate = new Date(start);
  
  switch (planType) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'annually':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      throw new Error('Invalid plan type');
  }
  
  return endDate;
};

// Helper function to calculate next payment date
const calculateNextPaymentDate = (currentDate, planType) => {
  return calculateEndDate(currentDate, planType);
};

// Get available subscription plans with pricing
const getSubscriptionPlans = async (req, res) => {
  try {
    const { userCurrency } = req.query;
    
    let whereClause = {};
    if (userCurrency) {
      whereClause.currency = userCurrency.toUpperCase();
    }

    const currencies = await Currency.findAll({
      where: whereClause,
      order: [['currency', 'ASC']]
    });

    const plans = currencies.map(curr => ({
      currencyId: curr.id,
      currency: curr.currency,
      plans: {
        monthly: {
          amount: parseFloat(curr.monthly),
          interval: 'month',
          intervalCount: 1
        },
        quarterly: {
          amount: parseFloat(curr.quarterly),
          interval: 'month',
          intervalCount: 3
        },
        annually: {
          amount: parseFloat(curr.annually),
          interval: 'year',
          intervalCount: 1
        }
      }
    }));

    return res.status(200).json({
      msg: 'Subscription plans retrieved successfully',
      plans
    });

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return res.status(500).json({
      msg: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
};

// Create a payment intent for subscription
const createPaymentIntent = async (req, res) => {
  try {
    const { userId, currencyId, planType } = req.body;

    // Validate required fields
    if (!userId || !currencyId || !planType) {
      return res.status(400).json({
        msg: 'User ID, Currency ID, and Plan Type are required'
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get currency and pricing
    const currency = await Currency.findByPk(currencyId);
    if (!currency) {
      return res.status(404).json({ msg: 'Currency not found' });
    }

    // Get amount based on plan type
    let amount;
    switch (planType) {
      case 'monthly':
        amount = parseFloat(currency.monthly);
        break;
      case 'quarterly':
        amount = parseFloat(currency.quarterly);
        break;
      case 'annually':
        amount = parseFloat(currency.annually);
        break;
      default:
        return res.status(400).json({ msg: 'Invalid plan type' });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      where: {
        userId,
        status: ['active', 'pending']
      }
    });

    if (existingSubscription) {
      return res.status(400).json({
        msg: 'User already has an active or pending subscription'
      });
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id
        }
      });
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await user.update({ stripeCustomerId });
    }

    // Convert amount to smallest currency unit (cents for USD, kobo for NGN, etc.)
    const stripeAmount = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: currency.currency.toLowerCase(),
      customer: stripeCustomerId,
      metadata: {
        userId,
        currencyId,
        planType,
        subscriptionType: 'platform_subscription'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create subscription record in pending status
    const subscription = await Subscription.create({
      userId,
      currencyId,
      stripeCustomerId,
      stripePaymentIntentId: paymentIntent.id,
      planType,
      amount,
      currency: currency.currency,
      status: 'pending',
      autoRenew: true
    });

    return res.status(201).json({
      msg: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      amount,
      currency: currency.currency
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({
      msg: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Confirm subscription payment
const confirmSubscription = async (req, res) => {
  try {
    const { subscriptionId, paymentIntentId } = req.body;

    if (!subscriptionId || !paymentIntentId) {
      return res.status(400).json({
        msg: 'Subscription ID and Payment Intent ID are required'
      });
    }

    // Find the subscription
    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [
        { model: User, as: 'user' },
        { model: Currency, as: 'currency' }
      ]
    });

    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const startDate = new Date();
      const endDate = calculateEndDate(startDate, subscription.planType);
      const nextPaymentDate = subscription.autoRenew ? 
        calculateNextPaymentDate(startDate, subscription.planType) : null;

      // Update subscription status
      await subscription.update({
        status: 'active',
        startDate,
        endDate,
        lastPaymentDate: startDate,
        nextPaymentDate,
        metadata: {
          stripePaymentIntent: paymentIntent.id,
          stripeChargeId: paymentIntent.charges.data[0]?.id
        }
      });

      // Update user subscription status
      await subscription.user.update({ subscribed: true });

      return res.status(200).json({
        msg: 'Subscription activated successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          planType: subscription.planType,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          amount: subscription.amount,
          currency: subscription.currency
        }
      });

    } else if (paymentIntent.status === 'requires_payment_method') {
      await subscription.update({ status: 'failed' });
      return res.status(400).json({
        msg: 'Payment failed. Please try with a different payment method.'
      });
    } else {
      return res.status(400).json({
        msg: 'Payment not completed yet',
        status: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Error confirming subscription:', error);
    return res.status(500).json({
      msg: 'Failed to confirm subscription',
      error: error.message
    });
  }
};

// Get user's subscription details
const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscription = await Subscription.findOne({
      where: { userId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Currency, as: 'currency' }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!subscription) {
      return res.status(404).json({ msg: 'No subscription found for this user' });
    }

    return res.status(200).json({
      subscription
    });

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return res.status(500).json({
      msg: 'Failed to fetch subscription',
      error: error.message
    });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelReason } = req.body;

    const subscription = await Subscription.findByPk(subscriptionId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ msg: 'Only active subscriptions can be cancelled' });
    }

    // Update subscription status
    await subscription.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: cancelReason || 'User requested cancellation',
      autoRenew: false
    });

    // Update user subscription status
    await subscription.user.update({ subscribed: false });

    return res.status(200).json({
      msg: 'Subscription cancelled successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelledAt: subscription.cancelledAt
      }
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({
      msg: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

// Webhook handler for Stripe events
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        // Handle failed payment
        const failedPayment = event.data.object;
        await Subscription.update(
          { status: 'failed' },
          { where: { stripePaymentIntentId: failedPayment.id } }
        );
        break;

      case 'customer.subscription.deleted':
        // Handle subscription deletion
        const deletedSubscription = event.data.object;
        await Subscription.update(
          { status: 'cancelled', cancelledAt: new Date() },
          { where: { stripeSubscriptionId: deletedSubscription.id } }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
};

// Get all subscriptions (admin endpoint)
const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, planType } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (planType) whereClause.planType = planType;

    const { count, rows: subscriptions } = await Subscription.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Currency, as: 'currency' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      subscriptions,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalSubscriptions: count
    });

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return res.status(500).json({
      msg: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
};

module.exports = {
  getSubscriptionPlans,
  createPaymentIntent,
  confirmSubscription,
  getUserSubscription,
  cancelSubscription,
  handleStripeWebhook,
  getAllSubscriptions
};