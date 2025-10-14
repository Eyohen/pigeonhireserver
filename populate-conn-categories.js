// populate-conn-categories.js
require('dotenv').config();
const db = require('./models');

const connectionCategories = [
  'Social Community',
  'Newsletter Community',
  'Retail Store',
  'Service Provider Network',
  'Event Community',
  'Educational Community',
  'Influencer Community',
  'Content Creator Hub',
  'Local Business Association',
  'Coworking Space Network',
  'Startup Ecosystem',
  'Club and Group Community',
  'PR and Marketing Network',
  'Student Network',
  'Business Partnership Circle',
  'Sales Network',
  'Networking Circles',
  'Professional Networks (e.g., LinkedIn Groups)',
  'Industry-Specific Forums (e.g., Tech, Health, Finance)',
  'Freelancer and Gig Economy Groups',
  'Alumni Networks',
  'Mentorship Communities',
  'Referral Partner Groups',
  'Brand Ambassador Communities',
  'Product Evangelist Networks',
  'Marketing Collaboration Hubs',
  'Sales Coaching Groups',
  'Volunteer Networks',
  'Advocacy and Social Impact Communities',
  'Career Development Groups',
  'Job Seeker Networks',
  'Entrepreneurial Circles',
  'Innovation Hubs',
  'Women in Business/Leadership Networks',
  'Diversity and Inclusion Groups',
  'Peer Advisory Boards',
  'Special Interest Communities (e.g., Hobby Groups)',
  'Local Meetups',
  'Professional Associations (e.g., Medical, Legal, Engineering)',
  'Event Support Networks (e.g., Wingmen/Women)'
];

async function populateConnCategories() {
  try {
    console.log('Starting Connection Categories population...');
    
    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the model (optional - creates table if it doesn't exist)
    await db.ConnCategory.sync({ alter: true });
    console.log('ConnCategory model synced.');

    // Check if data already exists
    const existingCount = await db.ConnCategory.count();
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
        await db.ConnCategory.destroy({ where: {}, truncate: true });
        console.log('Existing data cleared.');
      } else {
        console.log('Skipping population. Exiting...');
        process.exit(0);
      }
    }

    // Insert connection categories
    const categories = connectionCategories.map(category => ({
      connCategory: category
    }));

    const result = await db.ConnCategory.bulkCreate(categories);
    
    console.log(`✅ Successfully populated ${result.length} connection categories!`);
    
    // Display inserted records
    console.log('\nInserted categories:');
    result.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.connCategory} (ID: ${cat.id})`);
    });

  } catch (error) {
    console.error('❌ Error populating connection categories:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run the population function
populateConnCategories();