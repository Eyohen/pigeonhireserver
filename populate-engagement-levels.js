/**
 * Script to populate EngagementLevel table
 * Run with: node populate-engagement-levels.js
 */

const db = require("./models");

const engagementLevels = [
  "Active Participation",
  "Passive Engagement",
  "Event Participation",
  "Content Creation",
  "Networking and Collaboration",
  "Peer Support and Mentorship",
  "Advocacy and Promotion",
  "Feedback and Survey Participation",
  "Gamification and Challenges",
  "Resource Sharing",
  "Social Interaction",
  "Leadership and Governance",
  "Financial Contribution",
  "Volunteering"
];

async function populateEngagementLevels() {
  try {
    console.log("Starting to populate EngagementLevel table...");

    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync the model (optional - creates table if it doesn't exist)
    await db.EngagementLevel.sync();
    console.log("EngagementLevel model synced.");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await db.EngagementLevel.destroy({ where: {}, truncate: true });
    console.log("Cleared existing EngagementLevel data.");

    // Insert engagement levels
    const createdLevels = [];
    for (const level of engagementLevels) {
      const engagementLevel = await db.EngagementLevel.create({
        engagementLevel: level
      });
      createdLevels.push(engagementLevel);
      console.log(`✓ Created: ${level}`);
    }

    console.log(`\n✅ Successfully populated ${createdLevels.length} engagement levels.`);
    
    // Display summary
    console.log("\nSummary of created engagement levels:");
    createdLevels.forEach((level, index) => {
      console.log(`${index + 1}. ${level.engagementLevel} (ID: ${level.id})`);
    });

  } catch (error) {
    console.error("❌ Error populating EngagementLevel table:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log("\nDatabase connection closed.");
    process.exit();
  }
}

// Run the population script
populateEngagementLevels();