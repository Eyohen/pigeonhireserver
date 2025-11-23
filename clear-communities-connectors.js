#!/usr/bin/env node
/**
 * Script to clear all communities and connectors from the database
 * Run with: node clear-communities-connectors.js
 */

require('dotenv').config();
const db = require('./models');
const readline = require('readline');

async function clearData() {
  try {
    console.log('\n⚠️  WARNING: This will delete ALL communities and connectors from the database!');
    console.log('This action cannot be undone.\n');

    // Create readline interface for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('Are you sure you want to continue? (yes/no): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('Operation cancelled.');
      process.exit(0);
    }

    console.log('\nConnecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.\n');

    // Count existing records
    const communityCount = await db.Community.count();
    const connectorCount = await db.Connector.count();

    console.log(`Found ${communityCount} communities and ${connectorCount} connectors.\n`);

    if (communityCount === 0 && connectorCount === 0) {
      console.log('No data to clear. Exiting...');
      process.exit(0);
    }

    // Clear connectors first (due to foreign key constraints)
    console.log('Clearing connectors...');
    await db.Connector.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Connectors cleared.');

    // Clear communities
    console.log('Clearing communities...');
    await db.Community.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Communities cleared.');

    console.log('\n🎉 All communities and connectors have been successfully removed!');
    console.log('Your database is now ready for fresh data.');

  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await db.sequelize.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

clearData();
