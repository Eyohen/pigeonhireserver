// populate-community-types.js
require('dotenv').config();
const db = require('./models');

const communityTypes = [
  {
    communityType: 'Social and Interest-Based Communities',
    commTypeCategory: [
      'Hobbyist Communities',
      'Fan Clubs',
      'Book Clubs and Literary Groups'
    ]
  },
  {
    communityType: 'Gaming Communities',
    commTypeCategory: [
      'Video Game Enthusiast Groups',
      'Board Game Clubs',
      'Role-Playing Game Communities'
    ]
  },
  {
    communityType: 'Art and Craft Communities',
    commTypeCategory: [
      'Art and Craft Communities',
      'Music and Dance Groups'
    ]
  },
  {
    communityType: 'Professional and Business-Oriented Communities',
    commTypeCategory: [
      'Industry-Specific Groups',
      'Startup and Entrepreneur Networks',
      'Freelancers and Remote Workers',
      'Corporate Alumni Networks',
      'Educational Alumni Groups'
    ]
  },
  {
    communityType: 'Health and Wellness Communities',
    commTypeCategory: [
      'Fitness and Sports Groups',
      'Support Groups',
      'Healthy Living and Nutrition'
    ]
  },
  {
    communityType: 'Cultural and Identity-Based Communities',
    commTypeCategory: [
      'Ethnic and Cultural Groups',
      'Religious and Spiritual Groups'
    ]
  },
  {
    communityType: 'Geographic and Local Communities',
    commTypeCategory: [
      'Neighborhood Associations',
      'City or Regional Groups',
      'Country-Specific Communities'
    ]
  },
  {
    communityType: 'Special Interest and Unique Communities',
    commTypeCategory: [
      'Environmental and Sustainability Groups',
      'Tech and Innovation Hubs',
      'Hobbyist Collectors',
      'Parenting and Family Groups'
    ]
  },
  {
    communityType: 'Online and Virtual Communities',
    commTypeCategory: [
      'Online Forums and Discussion Boards',
      'Social Media Groups',
      'Blogging and Content Creator Networks'
    ]
  },
  {
    communityType: 'Volunteer and Activism Groups',
    commTypeCategory: [
      'Charity and Non-Profit Organizations',
      'Political and Activism Groups'
    ]
  },
  {
    communityType: 'Academic and Research Communities',
    commTypeCategory: [
      'Scientific Research Groups',
      'Student Organizations'
    ]
  }
];

async function populateCommunityTypes() {
  try {
    console.log('Starting Community Types population...');
    
    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the model (optional - creates table if it doesn't exist)
    await db.CommunityType.sync({ alter: true });
    console.log('CommunityType model synced.');

    // Check if data already exists
    const existingCount = await db.CommunityType.count();
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
        await db.CommunityType.destroy({ where: {}, truncate: true });
        console.log('Existing data cleared.');
      } else {
        console.log('Skipping population. Exiting...');
        process.exit(0);
      }
    }

    // Insert community types
    const result = await db.CommunityType.bulkCreate(communityTypes);
    
    console.log(`✅ Successfully populated ${result.length} community types!`);
    
    // Display inserted records
    console.log('\nInserted community types:');
    result.forEach((type, index) => {
      console.log(`\n${index + 1}. ${type.communityType}`);
      console.log(`   ID: ${type.id}`);
      console.log(`   Secondary Categories (${type.commTypeCategory.length}):`);
      type.commTypeCategory.forEach((category, catIndex) => {
        console.log(`      ${catIndex + 1}. ${category}`);
      });
    });

    // Summary statistics
    const totalSecondaryCategories = communityTypes.reduce(
      (sum, type) => sum + type.commTypeCategory.length, 
      0
    );
    console.log(`\n📊 Summary:`);
    console.log(`   Total Primary Types: ${result.length}`);
    console.log(`   Total Secondary Categories: ${totalSecondaryCategories}`);

  } catch (error) {
    console.error('❌ Error populating community types:', error);
    console.error('Error details:', error.message);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run the population function
populateCommunityTypes();