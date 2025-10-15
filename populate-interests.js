const db = require('./models');
const { Interest } = db;

const interestsData = [
  {
    primaryType: "Arts and Culture",
    secondaryTypes: [
      "Visual Arts (painting, sculpture)",
      "Performing Arts (theater, dance, opera)",
      "Music (various genres, playing instruments)",
      "Literature (book clubs, writing groups)",
      "Film and Cinema (movie buffs, filmmaking)",
      "Photography",
      "Crafts (knitting, DIY crafts)",
      "Fashion and Design",
      "Culinary Arts (cooking, baking)"
    ]
  },
  {
    primaryType: "Technology and Science",
    secondaryTypes: [
      "Information Technology (programming, cybersecurity)",
      "Consumer Electronics (gadgets, home tech)",
      "Science Enthusiasts (astronomy, biology)",
      "Robotics and AI",
      "Gaming (video games, esports)",
      "Virtual Reality/Augmented Reality"
    ]
  },
  {
    primaryType: "Health and Wellness",
    secondaryTypes: [
      "Fitness and Exercise (yoga, gym, running)",
      "Mental Health Awareness",
      "Nutrition and Diet (veganism, keto, etc.)",
      "Alternative Medicine",
      "Sports and Athletics",
      "Outdoor Activities (hiking, camping)"
    ]
  },
  {
    primaryType: "Business and Finance",
    secondaryTypes: [
      "Entrepreneurship and Startups",
      "Investing (stocks, real estate)",
      "Personal Finance (budgeting, saving)",
      "Leadership and Management",
      "Marketing and Advertising",
      "E-commerce"
    ]
  },
  {
    primaryType: "Education and Learning",
    secondaryTypes: [
      "Language Learning",
      "Online Courses and MOOCs",
      "Educational Resources for Children",
      "Professional Development",
      "History Buffs",
      "Science and Research"
    ]
  },
  {
    primaryType: "Social and Community",
    secondaryTypes: [
      "Volunteering and Social Causes",
      "Local Community Events",
      "Parenting and Family Groups",
      "Student Organizations",
      "Cultural and Ethnic Groups",
      "Religious and Spiritual Groups"
    ]
  },
  {
    primaryType: "Lifestyle and Hobbies",
    secondaryTypes: [
      "Travel and Exploration",
      "Gardening and Horticulture",
      "Pet Owners and Animal Lovers",
      "Cooking and Food Enthusiasts",
      "DIY Home Improvement",
      "Collectibles and Antiques",
      "Cars and Motorcycles",
      "Boating and Sailing",
      "Fishing and Hunting"
    ]
  },
  {
    primaryType: "Entertainment and Leisure",
    secondaryTypes: [
      "Board Games and Puzzles",
      "Comics and Anime",
      "Fan Clubs (TV shows, movies, celebrities)",
      "Humor and Comedy",
      "Magic and Illusion"
    ]
  },
  {
    primaryType: "Environment and Sustainability",
    secondaryTypes: [
      "Environmental Activism",
      "Renewable Energy",
      "Sustainable Living",
      "Wildlife Conservation"
    ]
  },
  {
    primaryType: "Special Interest",
    secondaryTypes: [
      "Astrology and Mysticism",
      "Conspiracy Theories",
      "Survivalism and Prepping",
      "Cryptocurrency and Blockchain"
    ]
  },
  {
    primaryType: "Creative and Expressive",
    secondaryTypes: [
      "Writing and Blogging",
      "Podcasting and Vlogging",
      "Stand-up Comedy",
      "Digital Art and Animation"
    ]
  },
  {
    primaryType: "Business Technologies",
    secondaryTypes: [
      "Enterprise Software Solutions",
      "Business Intelligence Tools",
      "Fintech",
      "E-commerce Platforms",
      "Digital Marketing Technologies",
      "Cybersecurity Solutions",
      "Cloud Computing and Storage",
      "Project Management Tools",
      "Artificial Intelligence and Machine Learning in Business",
      "Remote Work Technologies",
      "Supply Chain and Logistics Tech",
      "HR Tech",
      "Sales Tech",
      "IoT in Business",
      "Green Tech in Business"
    ]
  }
];

async function populateInterests() {
  try {
    console.log('Starting to populate Interest table...');

    // Connect to database
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync the Interest model (creates table if it doesn't exist)
    await Interest.sync({ alter: true });
    console.log('Interest table synced.');

    // Optional: Clear existing data
    await Interest.destroy({ where: {}, truncate: true });
    console.log('Cleared existing Interest data.');

    // Populate interests
    let totalInserted = 0;
    const createdInterests = [];

    for (const category of interestsData) {
      const { primaryType, secondaryTypes } = category;
      console.log(`\nProcessing category: ${primaryType}`);

      for (const secondaryType of secondaryTypes) {
        const interest = await Interest.create({
          primaryType,
          secondaryType
        });
        createdInterests.push(interest);
        totalInserted++;
        console.log(`  ✓ Created: ${secondaryType}`);
      }
    }

    console.log(`\n✅ Successfully inserted ${totalInserted} interests!`);

    // Display summary
    console.log('\nSummary of interests by category:');
    const grouped = createdInterests.reduce((acc, interest) => {
      if (!acc[interest.primaryType]) {
        acc[interest.primaryType] = 0;
      }
      acc[interest.primaryType]++;
      return acc;
    }, {});

    Object.entries(grouped).forEach(([primary, count]) => {
      console.log(`  ${primary}: ${count} interests`);
    });

  } catch (error) {
    console.error('❌ Error populating interests:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\nDatabase connection closed.');
    process.exit();
  }
}

populateInterests();
