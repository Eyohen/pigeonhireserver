// Quick script to check communities in the database
const db = require("./models");
const { Community } = db;

async function checkCommunities() {
  try {
    console.log("\n=== CHECKING ALL COMMUNITIES ===\n");

    const communities = await Community.findAll({
      attributes: ['id', 'name', 'userId', 'recordType', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    console.log(`Total communities found: ${communities.length}\n`);

    communities.forEach((community, index) => {
      console.log(`${index + 1}. ${community.name}`);
      console.log(`   ID: ${community.id}`);
      console.log(`   userId: ${community.userId || 'NULL'}`);
      console.log(`   recordType: ${community.recordType}`);
      console.log(`   Created: ${community.createdAt}`);
      console.log('');
    });

    // Group by userId
    const byUser = {};
    communities.forEach(c => {
      const userId = c.userId || 'NULL';
      if (!byUser[userId]) byUser[userId] = [];
      byUser[userId].push(c.name);
    });

    console.log("\n=== COMMUNITIES BY USER ===\n");
    Object.entries(byUser).forEach(([userId, names]) => {
      console.log(`User ${userId}: ${names.length} communities`);
      names.forEach(name => console.log(`  - ${name}`));
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkCommunities();
