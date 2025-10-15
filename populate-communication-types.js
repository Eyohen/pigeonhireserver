const db = require('./models');
const { CommunicationType } = db;

const communicationTypesData = [
  {
    primaryType: "Social Media Platforms",
    secondaryTypes: [
      "Facebook",
      "LinkedIn"
    ]
  },
  {
    primaryType: "Messaging Apps",
    secondaryTypes: [
      "WhatsApp",
      "Telegram",
      "Signal",
      "WeChat",
      "Line",
      "Viber"
    ]
  },
  {
    primaryType: "Professional Networking",
    secondaryTypes: [
      "LinkedIn",
      "Slack",
      "Microsoft Teams"
    ]
  },
  {
    primaryType: "Online Forums and Discussion Boards",
    secondaryTypes: [
      "Reddit",
      "Quora",
      "Discourse",
      "phpBB",
      "Nairaland"
    ]
  },
  {
    primaryType: "Video Conferencing Tools",
    secondaryTypes: [
      "Zoom",
      "Google Meet",
      "Skype",
      "Webex"
    ]
  },
  {
    primaryType: "Newsletters",
    secondaryTypes: []
  },
  {
    primaryType: "Retail Store",
    secondaryTypes: []
  },
  {
    primaryType: "Content Sharing Platforms",
    secondaryTypes: [
      "YouTube",
      "Vimeo",
      "Twitch",
      "Dailymotion"
    ]
  },
  {
    primaryType: "Media Platforms",
    secondaryTypes: [
      "Radio",
      "Podcast",
      "Television",
      "Newspaper"
    ]
  },
  {
    primaryType: "Blogging and Microblogging Platforms",
    secondaryTypes: [
      "WordPress",
      "Medium",
      "Blogger",
      "Tumblr"
    ]
  },
  {
    primaryType: "Community-Specific Platforms",
    secondaryTypes: [
      "Nextdoor",
      "Meetup"
    ]
  },
  {
    primaryType: "Voice Communication Tools",
    secondaryTypes: [
      "Discord",
      "TeamSpeak",
      "Mumble"
    ]
  },
  {
    primaryType: "Executive Network",
    secondaryTypes: []
  },
  {
    primaryType: "Associations",
    secondaryTypes: []
  },
  {
    primaryType: "Offline Groups",
    secondaryTypes: []
  }
];

async function populateCommunicationTypes() {
  try {
    console.log('Starting to populate CommunicationType table...');

    // Connect to database
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the CommunicationType model (creates table if it doesn't exist)
    await CommunicationType.sync({ alter: true });
    console.log('CommunicationType table synced.');

    // Optional: Clear existing data
    await CommunicationType.destroy({ where: {}, truncate: true });
    console.log('Cleared existing CommunicationType data.');

    // Populate communication types
    let totalInserted = 0;
    const createdCommunicationTypes = [];

    for (const category of communicationTypesData) {
      const { primaryType, secondaryTypes } = category;
      console.log(`\nProcessing category: ${primaryType}`);

      if (secondaryTypes.length === 0) {
        // For primary types with no secondary types, insert a single record with null secondaryType
        const communicationType = await CommunicationType.create({
          primaryType,
          secondaryType: null
        });
        createdCommunicationTypes.push(communicationType);
        totalInserted++;
        console.log(`  ✓ Created: ${primaryType} (standalone)`);
      } else {
        for (const secondaryType of secondaryTypes) {
          const communicationType = await CommunicationType.create({
            primaryType,
            secondaryType
          });
          createdCommunicationTypes.push(communicationType);
          totalInserted++;
          console.log(`  ✓ Created: ${secondaryType}`);
        }
      }
    }

    console.log(`\n✅ Successfully inserted ${totalInserted} communication types!`);

    // Display summary
    console.log('\nSummary of communication types by category:');
    const grouped = createdCommunicationTypes.reduce((acc, commType) => {
      if (!acc[commType.primaryType]) {
        acc[commType.primaryType] = 0;
      }
      acc[commType.primaryType]++;
      return acc;
    }, {});

    Object.entries(grouped).forEach(([primary, count]) => {
      console.log(`  ${primary}: ${count} type(s)`);
    });

  } catch (error) {
    console.error('❌ Error populating communication types:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\nDatabase connection closed.');
    process.exit();
  }
}

populateCommunicationTypes();
