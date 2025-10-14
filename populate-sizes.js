// populate-sizes.js
require('dotenv').config();
const db = require('./models');

const sizes = [
  '1-50 members/visitors',
  '51-100 members/visitors',
  '101-250 members/visitors',
  '251-500 members/visitors',
  '501-1,000 members/visitors',
  '1,001-2,500 members/visitors',
  '2,501-5,000 members/visitors',
  '5,001-10,000 members/visitors',
  '10,001-25,000 members/visitors',
  '25,001-50,000 members/visitors',
  '50,001-100,000 members/visitors',
  '100,001-500,000 members/visitors',
  '500,001-1,000,000 members/visitors',
  'Over 1,000,000 members/visitors'
];

async function populateSizes() {
  try {
    console.log('Starting Sizes population...');
    
    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the model (optional - creates table if it doesn't exist)
    await db.Size.sync({ alter: true });
    console.log('Size model synced.');

    // Check if data already exists
    const existingCount = await db.Size.count();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing records.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        readline.question('Do you want to clear existing data and repopulate? (yes/no): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        await db.Size.destroy({ where: {}, truncate: true });
        console.log('Existing data cleared.');
      } else {
        console.log('Skipping population. Exiting...');
        process.exit(0);
      }
    }

    // Insert sizes
    const sizeRecords = sizes.map(size => ({
      size: size
    }));

    const result = await db.Size.bulkCreate(sizeRecords);
    
    console.log(`✅ Successfully populated ${result.length} size categories!`);
    
    // Display inserted records
    console.log('\nInserted sizes:');
    result.forEach((sizeRecord, index) => {
      console.log(`${index + 1}. ${sizeRecord.size} (ID: ${sizeRecord.id})`);
    });

  } catch (error) {
    console.error('❌ Error populating sizes:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run the population function
populateSizes();