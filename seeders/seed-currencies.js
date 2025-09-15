// seeders/seed-currencies.js
const db = require('../models');
const { Currency } = db;

const currencyData = [
  { currency: 'CAD', monthly: 4.99, quarterly: 25.45, annually: 41.92 },
  { currency: 'NGN', monthly: 4900, quarterly: 24990, annually: 41160 },
  { currency: 'AUD', monthly: 13.26, quarterly: 67.61, annually: 111.36 },
  { currency: 'EUR', monthly: 3.32, quarterly: 16.97, annually: 27.95 },
  { currency: 'GBP', monthly: 2.77, quarterly: 14.13, annually: 23.28 },
  { currency: 'USD', monthly: 3.61, quarterly: 18.41, annually: 30.32 },
  { currency: 'ZMW', monthly: 96.26, quarterly: 490.97, annually: 808.66 },
  { currency: 'INR', monthly: 303.43, quarterly: 1547.54, annually: 2548.88 }
];

const seedCurrencies = async () => {
  try {
    // Clear existing currencies (optional)
    await Currency.destroy({ where: {} });
    
    // Insert new currencies
    await Currency.bulkCreate(currencyData);
    
    console.log('✅ Currencies seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding currencies:', error);
    process.exit(1);
  }
};

seedCurrencies();