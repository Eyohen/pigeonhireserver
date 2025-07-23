// debug-subscription.js - Run this to see what's in your subscription file
const fs = require('fs');
const path = require('path');

function debugSubscriptionFile() {
  try {
    const subscriptionPath = path.join(__dirname, 'models', 'subscription.js');
    
    console.log('🔍 Debugging subscription.js file...');
    console.log('📍 File path:', subscriptionPath);
    
    if (!fs.existsSync(subscriptionPath)) {
      console.log('❌ Subscription file not found!');
      return;
    }
    
    const content = fs.readFileSync(subscriptionPath, 'utf8');
    const lines = content.split('\n');
    
    console.log('\n🔎 Looking for association problems...\n');
    
    // Find lines with 'currency' in them
    lines.forEach((line, index) => {
      if (line.includes('currency') || line.includes('Currency')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
      }
    });
    
    console.log('\n📋 Association section:');
    
    // Find the associate function
    let inAssociate = false;
    let braceCount = 0;
    
    lines.forEach((line, index) => {
      if (line.includes('static associate(models)') || line.includes('associate(models)')) {
        inAssociate = true;
        console.log(`Line ${index + 1}: ${line.trim()}`);
      } else if (inAssociate) {
        if (line.includes('{')) braceCount++;
        if (line.includes('}')) braceCount--;
        
        console.log(`Line ${index + 1}: ${line.trim()}`);
        
        if (braceCount <= 0 && line.includes('}')) {
          inAssociate = false;
        }
      }
    });
    
    console.log('\n🎯 Recommendations:');
    
    if (content.includes("as: 'currency'")) {
      console.log('❌ FOUND THE PROBLEM: You still have "as: \'currency\'" in your file');
      console.log('✅ SOLUTION: Change "as: \'currency\'" to "as: \'currencyDetails\'"');
    } else if (content.includes("as: 'currencyDetails'")) {
      console.log('✅ Good: Association alias is set to "currencyDetails"');
    } else {
      console.log('❓ Could not find association alias - please check manually');
    }
    
    if (content.includes('currency: {')) {
      console.log('📝 INFO: Found currency column definition');
    }
    
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
  }
}

// Run the debug
debugSubscriptionFile();