/**
 * Script to populate InteractionType table
 * Run with: node populate-interaction-types.js
 */

const db = require("./models");

const interactionTypes = [
  "Growth",
  "Engagement",
  "Networking",
  "Knowledge Sharing",
  "Support",
  "Advocacy",
  "Skill Development",
  "Resource Sharing",
  "Innovation",
  "Cultural Exchange",
  "Sustainability",
  "Fundraising",
  "Brand Building",
  "Diversity and Inclusion",
  "Community Service",
  "Health and Wellness",
  "Event Planning",
  "Member Recognition",
  "Feedback and Improvement",
  "Purchase and Sale"
];

async function populateInteractionTypes() {
  try {
    console.log("Starting to populate InteractionType table...");

    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sync the model (optional - creates table if it doesn't exist)
    await db.InteractionType.sync({ alter: true });
    console.log("InteractionType model synced.");

    // Clear existing data (optional - comment out if you want to keep existing data)
    await db.InteractionType.destroy({ where: {}, truncate: true });
    console.log("Cleared existing InteractionType data.");

    // Insert interaction types
    const createdTypes = [];
    for (const type of interactionTypes) {
      const interactionType = await db.InteractionType.create({
        interactionType: type
      });
      createdTypes.push(interactionType);
      console.log(`✓ Created: ${type}`);
    }

    console.log(`\n✅ Successfully populated ${createdTypes.length} interaction types.`);

    // Display summary
    console.log("\nSummary of created interaction types:");
    createdTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type.interactionType} (ID: ${type.id})`);
    });

  } catch (error) {
    console.error("❌ Error populating InteractionType table:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log("\nDatabase connection closed.");
    process.exit();
  }
}

// Run the population script
populateInteractionTypes();
