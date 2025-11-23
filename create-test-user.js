// create-test-user.js - Script to create a test user in the database
const bcrypt = require("bcrypt");
const db = require("./models");
const { User } = db;

const createTestUser = async () => {
  try {
    // Test user credentials
    const testUser = {
      firstName: "Test",
      lastName: "User",
      email: "test@pigeonhire.com",
      password: "Test123!",
      verified: true, // Set to true so user can login immediately
      role: "user",
      currency: "USD"
    };

    console.log("Connecting to database...");

    // Authenticate database connection
    await db.sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: testUser.email }
    });

    if (existingUser) {
      console.log("\n⚠️  User already exists!");
      console.log("Email:", testUser.email);
      console.log("\nYou can use these credentials to login:");
      console.log("=====================================");
      console.log("Email:    test@pigeonhire.com");
      console.log("Password: Test123!");
      console.log("=====================================\n");
      process.exit(0);
    }

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // Create the user
    console.log("Creating test user...");
    const newUser = await User.create({
      ...testUser,
      password: hashedPassword
    });

    console.log("\n✅ Test user created successfully!");
    console.log("\nLogin Credentials:");
    console.log("=====================================");
    console.log("Email:    test@pigeonhire.com");
    console.log("Password: Test123!");
    console.log("=====================================");
    console.log("\nUser Details:");
    console.log("- ID:", newUser.id);
    console.log("- Name:", `${newUser.firstName} ${newUser.lastName}`);
    console.log("- Verified:", newUser.verified);
    console.log("- Role:", newUser.role);
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating test user:");
    console.error(error.message);
    console.error("\nFull error:", error);
    process.exit(1);
  }
};

createTestUser();
