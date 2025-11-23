#!/usr/bin/env node
/**
 * Master script to populate all reference/lookup tables
 * Runs all populate scripts in sequence
 * Run with: node populate-all.js
 */

require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const populateScripts = [
  { name: 'Sizes', file: 'populate-sizes.js' },
  { name: 'Community Types', file: 'populate-community-types.js' },
  { name: 'Engagement Levels', file: 'populate-engagement-levels.js' },
  { name: 'Interaction Types', file: 'populate-interaction-types.js' },
  { name: 'Content Shared', file: 'populate-content-shared.js' },
  { name: 'Communication Types', file: 'populate-communication-types.js' },
  { name: 'Connector Categories', file: 'populate-conn-categories.js' },
  { name: 'Interests', file: 'populate-interests.js' }
];

async function runScript(scriptName, scriptFile) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Running: ${scriptName}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Run the script with echo "yes" to auto-confirm prompts
    const { stdout, stderr } = await execPromise(`echo "yes" | node ${scriptFile}`, {
      cwd: __dirname
    });

    console.log(stdout);
    if (stderr && !stderr.includes('ExperimentalWarning')) {
      console.error(stderr);
    }

    console.log(`✅ Completed: ${scriptName}\n`);
    return { name: scriptName, success: true };
  } catch (error) {
    console.error(`❌ Error running ${scriptName}:`);
    console.error(error.message);
    return { name: scriptName, success: false, error: error.message };
  }
}

async function populateAll() {
  console.log('\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(10) + 'POPULATING ALL REFERENCE TABLES' + ' '.repeat(16) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');
  console.log('\n');

  const results = [];

  for (const script of populateScripts) {
    const result = await runScript(script.name, script.file);
    results.push(result);

    // Add a small delay between scripts to ensure clean database connections
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Display summary
  console.log('\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(20) + 'SUMMARY' + ' '.repeat(31) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');
  console.log('\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n📊 Results: ${successful} successful, ${failed} failed out of ${results.length} scripts`);

  if (failed === 0) {
    console.log('\n🎉 All reference tables have been successfully populated!');
    console.log('Your database is now ready with all lookup data.');
  } else {
    console.log('\n⚠️  Some scripts failed. Please check the errors above.');
  }

  console.log('\n');
  process.exit(failed > 0 ? 1 : 0);
}

// Run the master population script
populateAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
