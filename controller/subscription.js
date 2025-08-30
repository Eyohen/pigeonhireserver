//controller/subscription.js
const db = require('../models');
const { Subscription, User, Currency } = db;
const { Op } = require('sequelize');


// Enhanced Stripe webhook handler with proper event processing
const handleStripeWebhook = async (req, res) => {
  let event;

  try {
    // In production, you should verify the webhook signature
    // const signature = req.headers['stripe-signature'];
    // event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    
    // For now, we'll process the raw event
    event = req.body;
    
    console.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook handling failed', details: error.message });
  }
};

// Handle successful checkout session (main subscription creation)
const handleCheckoutSessionCompleted = async (session) => {
  try {
    console.log('Processing checkout.session.completed:', session.id);

    const {
      customer,
      subscription: stripeSubscriptionId,
      metadata,
      amount_total,
      currency: sessionCurrency,
      payment_intent,
      mode,
      customer_details
    } = session;

    // Extract metadata passed from frontend
    const {
      userId,
      currencyId,
      planType,
      priceId,
      userEmail,
      userName
    } = metadata || {};

    if (!userId || !currencyId || !planType) {
      throw new Error('Missing required metadata: userId, currencyId, planType required');
    }

    // Validate UUID formats
    if (!isValidUUID(userId) || !isValidUUID(currencyId)) {
      throw new Error('Invalid UUID format for userId or currencyId');
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      where: { 
        [Op.or]: [
          { stripeSubscriptionId },
          { stripePaymentIntentId: payment_intent }
        ]
      }
    });

    if (existingSubscription) {
      console.log(`Subscription already exists for Stripe ID: ${stripeSubscriptionId}`);
      return;
    }

    // Get currency details and validate priceId
    const currencyRecord = await Currency.findByPk(currencyId);
    if (!currencyRecord) {
      throw new Error(`Currency not found: ${currencyId}`);
    }

    // Validate priceId matches the plan type and currency
    let expectedPriceId, subscriptionAmount;
    switch (planType) {
      case 'monthly':
        expectedPriceId = currencyRecord.monthlyPriceId;
        subscriptionAmount = parseFloat(currencyRecord.monthly);
        break;
      case 'quarterly':
        expectedPriceId = currencyRecord.quarterlyPriceId;
        subscriptionAmount = parseFloat(currencyRecord.quarterly);
        break;
      case 'annually':
        expectedPriceId = currencyRecord.annuallyPriceId;
        subscriptionAmount = parseFloat(currencyRecord.annually);
        break;
      default:
        throw new Error(`Invalid plan type: ${planType}`);
    }

    // Verify priceId if provided
    if (priceId && expectedPriceId && priceId !== expectedPriceId) {
      console.warn(`Price ID mismatch: expected ${expectedPriceId}, got ${priceId}`);
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = calculateEndDate(startDate, planType);
    const nextPaymentDate = calculateNextPaymentDate(startDate, planType);

    // Prepare comprehensive metadata
    const subscriptionMetadata = {
      // Stripe-related data
      stripeSessionId: session.id,
      stripePaymentIntentId: payment_intent,
      stripePriceId: priceId || expectedPriceId,
      stripeMode: mode,
      
      // Payment details
      originalAmount: amount_total ? (amount_total / 100) : subscriptionAmount, // Stripe amounts are in cents
      stripeCurrency: sessionCurrency,
      paymentStatus: 'completed',
      
      // User context
      userEmail: userEmail || customer_details?.email,
      userName: userName || customer_details?.name,
      customerIP: customer_details?.address?.country,
      
      // Plan details
      originalPlanType: planType,
      currencyId: currencyId,
      priceValidated: priceId === expectedPriceId,
      
      // Webhook processing info
      createdFromWebhook: true,
      webhookProcessedAt: new Date().toISOString(),
      webhookEventType: 'checkout.session.completed',
      
      // System metadata
      apiVersion: '2024-08-30',
      processingVersion: '1.0.0'
    };

    // Create subscription record with all required fields
    const subscription = await Subscription.create({
      // Core identifiers
      userId: userId, // Already UUID from frontend
      currencyId: currencyId, // Already UUID from frontend
      
      // Stripe integration fields
      stripeCustomerId: customer,
      stripeSubscriptionId: stripeSubscriptionId,
      stripePaymentIntentId: payment_intent,
      
      // Plan and pricing
      planType: planType,
      amount: subscriptionAmount,
      currency: currencyRecord.currency,
      
      // Status and dates
      status: 'active',
      startDate: startDate,
      endDate: endDate,
      autoRenew: true,
      
      // Payment tracking
      paymentMethod: 'card', // Default for Stripe checkout
      lastPaymentDate: startDate,
      nextPaymentDate: nextPaymentDate,
      
      // Rich metadata
      metadata: subscriptionMetadata
    });

    // Update user subscription status
    await User.update(
      { subscribed: true },
      { where: { id: userId } }
    );

    console.log(`Subscription created successfully: ${subscription.id}`, {
      userId,
      planType,
      amount: subscriptionAmount,
      currency: currencyRecord.currency,
      stripeSubscriptionId
    });

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    // Log structured error for debugging
    console.error('Session data:', {
      sessionId: session?.id,
      customer: session?.customer,
      metadata: session?.metadata,
      amount_total: session?.amount_total
    });
    throw error;
  }
};

// Helper function to validate UUID format
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Handle subscription creation (backup handler)
const handleSubscriptionCreated = async (subscription) => {
  try {
    console.log('Processing customer.subscription.created:', subscription.id);

    // Update existing subscription record if found
    const existingSubscription = await Subscription.findOne({
      where: { stripeSubscriptionId: subscription.id }
    });

    if (existingSubscription && existingSubscription.status !== 'active') {
      await existingSubscription.update({
        status: 'active',
        metadata: {
          ...existingSubscription.metadata,
          stripeStatus: subscription.status,
          activatedAt: new Date().toISOString()
        }
      });

      console.log(`Subscription activated: ${existingSubscription.id}`);
    }

  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
};

// Handle subscription updates
const handleSubscriptionUpdated = async (subscription) => {
  try {
    console.log('Processing customer.subscription.updated:', subscription.id);

    const existingSubscription = await Subscription.findOne({
      where: { stripeSubscriptionId: subscription.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!existingSubscription) {
      console.log(`No subscription found for Stripe ID: ${subscription.id}`);
      return;
    }

    // Map Stripe status to our status
    let newStatus = existingSubscription.status;
    let shouldUpdateUserStatus = false;

    switch (subscription.status) {
      case 'active':
        newStatus = 'active';
        shouldUpdateUserStatus = true;
        break;
      case 'canceled':
        newStatus = 'cancelled';
        shouldUpdateUserStatus = false;
        break;
      case 'incomplete':
      case 'incomplete_expired':
        newStatus = 'failed';
        shouldUpdateUserStatus = false;
        break;
      case 'past_due':
        newStatus = 'failed';
        shouldUpdateUserStatus = false;
        break;
      case 'unpaid':
        newStatus = 'failed';
        shouldUpdateUserStatus = false;
        break;
    }

    // Update subscription
    await existingSubscription.update({
      status: newStatus,
      cancelledAt: subscription.status === 'canceled' ? new Date() : null,
      autoRenew: subscription.status === 'active',
      metadata: {
        ...existingSubscription.metadata,
        stripeStatus: subscription.status,
        updatedAt: new Date().toISOString()
      }
    });

    // Update user status if needed
    if (shouldUpdateUserStatus !== null) {
      await existingSubscription.user.update({ subscribed: shouldUpdateUserStatus });
    }

    console.log(`Subscription updated: ${existingSubscription.id}, status: ${newStatus}`);

  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
};

// Handle subscription deletion
const handleSubscriptionDeleted = async (subscription) => {
  try {
    console.log('Processing customer.subscription.deleted:', subscription.id);

    const existingSubscription = await Subscription.findOne({
      where: { stripeSubscriptionId: subscription.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!existingSubscription) {
      console.log(`No subscription found for Stripe ID: ${subscription.id}`);
      return;
    }

    // Update subscription status
    await existingSubscription.update({
      status: 'cancelled',
      cancelledAt: new Date(),
      autoRenew: false,
      metadata: {
        ...existingSubscription.metadata,
        stripeStatus: 'canceled',
        deletedAt: new Date().toISOString()
      }
    });

    // Update user status
    await existingSubscription.user.update({ subscribed: false });

    console.log(`Subscription cancelled: ${existingSubscription.id}`);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
};

// Handle successful invoice payment
const handleInvoicePaymentSucceeded = async (invoice) => {
  try {
    console.log('Processing invoice.payment_succeeded:', invoice.id);

    if (!invoice.subscription) {
      return; // Not a subscription invoice
    }

    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription }
    });

    if (!subscription) {
      console.log(`No subscription found for Stripe ID: ${invoice.subscription}`);
      return;
    }

    // Calculate next payment date
    const nextPaymentDate = calculateNextPaymentDate(new Date(), subscription.planType);

    // Update subscription
    await subscription.update({
      status: 'active',
      lastPaymentDate: new Date(),
      nextPaymentDate,
      metadata: {
        ...subscription.metadata,
        lastInvoiceId: invoice.id,
        lastPaymentAmount: invoice.amount_paid,
        paymentSucceededAt: new Date().toISOString()
      }
    });

    console.log(`Payment recorded for subscription: ${subscription.id}`);

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    throw error;
  }
};

// Handle failed invoice payment
const handleInvoicePaymentFailed = async (invoice) => {
  try {
    console.log('Processing invoice.payment_failed:', invoice.id);

    if (!invoice.subscription) {
      return; // Not a subscription invoice
    }

    const subscription = await Subscription.findOne({
      where: { stripeSubscriptionId: invoice.subscription },
      include: [{ model: User, as: 'user' }]
    });

    if (!subscription) {
      console.log(`No subscription found for Stripe ID: ${invoice.subscription}`);
      return;
    }

    // Update subscription status
    await subscription.update({
      status: 'failed',
      metadata: {
        ...subscription.metadata,
        failedInvoiceId: invoice.id,
        paymentFailedAt: new Date().toISOString()
      }
    });

    // Optionally update user status (you might want to keep them subscribed for grace period)
    // await subscription.user.update({ subscribed: false });

    console.log(`Payment failed for subscription: ${subscription.id}`);

  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
};

// Handle payment intent success (for one-time payments)
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    console.log('Processing payment_intent.succeeded:', paymentIntent.id);

    // Find subscription by payment intent ID
    const subscription = await Subscription.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (subscription && subscription.status === 'pending') {
      await subscription.update({
        status: 'active',
        lastPaymentDate: new Date(),
        metadata: {
          ...subscription.metadata,
          paymentIntentSucceeded: true,
          activatedAt: new Date().toISOString()
        }
      });

      // Update user status
      await User.update(
        { subscribed: true },
        { where: { id: subscription.userId } }
      );

      console.log(`Payment intent succeeded for subscription: ${subscription.id}`);
    }

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
};

// Handle payment intent failure
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

    // Find subscription by payment intent ID
    const subscription = await Subscription.findOne({
      where: { stripePaymentIntentId: paymentIntent.id }
    });

    if (subscription) {
      await subscription.update({
        status: 'failed',
        metadata: {
          ...subscription.metadata,
          paymentIntentFailed: true,
          failedAt: new Date().toISOString()
        }
      });

      console.log(`Payment intent failed for subscription: ${subscription.id}`);
    }

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
};


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
          priceId: curr.monthlyPriceId,
          amount: parseFloat(curr.monthly),
          interval: 'month',
          intervalCount: 1
        },
        quarterly: {
          priceId: curr.quarterlyPriceId,
          amount: parseFloat(curr.quarterly),
          interval: 'month',
          intervalCount: 3
        },
        annually: {
          priceId: curr.annuallyPriceId,
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

// Get price details by priceId (useful for payment intent initialization)
const getPriceById = async (req, res) => {
  try {
    const { priceId } = req.params;

    // Find currency that has this priceId in any of its plan types
    const currency = await Currency.findOne({
      where: {
        [Op.or]: [
          { monthlyPriceId: priceId },
          { quarterlyPriceId: priceId },
          { annuallyPriceId: priceId }
        ]
      }
    });

    if (!currency) {
      return res.status(404).json({ msg: 'Price ID not found' });
    }

    // Determine which plan type this priceId belongs to
    let planType, amount;
    if (currency.monthlyPriceId === priceId) {
      planType = 'monthly';
      amount = parseFloat(currency.monthly);
    } else if (currency.quarterlyPriceId === priceId) {
      planType = 'quarterly';
      amount = parseFloat(currency.quarterly);
    } else if (currency.annuallyPriceId === priceId) {
      planType = 'annually';
      amount = parseFloat(currency.annually);
    }

    return res.status(200).json({
      priceId,
      currencyId: currency.id,
      currency: currency.currency,
      planType,
      amount,
      planDetails: {
        interval: planType === 'annually' ? 'year' : 'month',
        intervalCount: planType === 'quarterly' ? 3 : 1
      }
    });

  } catch (error) {
    console.error('Error fetching price details:', error);
    return res.status(500).json({
      msg: 'Failed to fetch price details',
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
        { model: Currency, as: 'currencyDetails' }
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

// Cancel subscription (frontend will handle Stripe cancellation)
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelReason, cancelledByStripe } = req.body;

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
      autoRenew: false,
      metadata: {
        ...subscription.metadata,
        cancelledByStripe: cancelledByStripe || false,
        cancelledAt: new Date().toISOString()
      }
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
        { model: Currency, as: 'currencyDetails' }
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

// Validate subscription status (useful for protecting routes)
const validateSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscription = await Subscription.findOne({
      where: { 
        userId,
        status: 'active',
        endDate: { [Op.gt]: new Date() }
      }
    });

    const isValid = !!subscription;

    return res.status(200).json({
      isValid,
      subscription: isValid ? {
        id: subscription.id,
        planType: subscription.planType,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew
      } : null
    });

  } catch (error) {
    console.error('Error validating subscription:', error);
    return res.status(500).json({
      msg: 'Failed to validate subscription',
      error: error.message
    });
  }
};

module.exports = {
  getSubscriptionPlans,
  getPriceById, 
  getUserSubscription,
  cancelSubscription,
  handleStripeWebhook,
  getAllSubscriptions,
  validateSubscription,
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed
};