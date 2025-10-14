// populate-content-shared.js
require('dotenv').config();
const db = require('./models');

const contentTypes = [
  'Articles and Blog Posts',
  'Videos',
  'Images and Infographics',
  'Podcasts',
  'Discussion Threads',
  'Polls and Surveys',
  'Event Announcements',
  'Tutorials and How-To Guides',
  'Newsletters',
  'E-books and Whitepapers',
  'Webinars and Online Workshops',
  'Interviews and Q&As',
  'Product Reviews',
  'Case Studies',
  'Social Media Posts',
  'User-Generated Content',
  'Research Papers and Reports',
  'Interactive Content (Quizzes, Games)',
  'Templates and Checklists',
  'Guest Contributions'
];

async function populateContentShared() {
  try {
    console.log('Starting Content Shared population...');
    
    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the model (optional - creates table if it doesn't exist)
    await db.ContentShared.sync({ alter: true });
    console.log('ContentShared model synced.');

    // Check if data already exists
    const existingCount = await db.ContentShared.count();
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
        await db.ContentShared.destroy({ where: {}, truncate: true });
        console.log('Existing data cleared.');
      } else {
        console.log('Skipping population. Exiting...');
        process.exit(0);
      }
    }

    // Insert content types
    const contentRecords = contentTypes.map(content => ({
      contentShared: content
    }));

    const result = await db.ContentShared.bulkCreate(contentRecords);
    
    console.log(`✅ Successfully populated ${result.length} content types!`);
    
    // Display inserted records
    console.log('\nInserted content types:');
    result.forEach((content, index) => {
      console.log(`${index + 1}. ${content.contentShared} (ID: ${content.id})`);
    });

  } catch (error) {
    console.error('❌ Error populating content shared:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run the population function
populateContentShared();