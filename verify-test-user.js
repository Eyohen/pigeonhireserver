// verify-test-user.js - Verify the test user exists and can login
const bcrypt = require("bcrypt");
const db = require("./models");
const { User } = db;

const verifyTestUser = async () => {
  try {
    console.log("Connecting to database...");
    await db.sequelize.authenticate();
    console.log("Database connection established.\n");

    // Find the test user
    const user = await User.findOne({
      where: { email: "test@pigeonhire.com" },
      attributes: ['id', 'firstName', 'lastName', 'email', 'verified', 'role', 'password']
    });

    if (!user) {
      console.log("❌ Test user not found!");
      process.exit(1);
    }

    console.log("✅ Test user found in database!");
    console.log("\nUser Details:");
    console.log("=====================================");
    console.log("ID:       ", user.id);
    console.log("Name:     ", `${user.firstName} ${user.lastName}`);
    console.log("Email:    ", user.email);
    console.log("Verified: ", user.verified);
    console.log("Role:     ", user.role);
    console.log("=====================================");

    // Test password verification
    const testPassword = "Test123!";
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);

    console.log("\nPassword Verification:");
    console.log("=====================================");
    console.log("Password:", testPassword);
    console.log("Valid:   ", isPasswordValid ? "✅ YES" : "❌ NO");
    console.log("=====================================\n");

    if (isPasswordValid) {
      console.log("🎉 You can now login with these credentials:\n");
      console.log("Email:    test@pigeonhire.com");
      console.log("Password: Test123!\n");
    } else {
      console.log("⚠️  Warning: Password verification failed!");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

verifyTestUser();
