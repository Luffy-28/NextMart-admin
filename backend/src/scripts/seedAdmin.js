import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { User } from "../models/userModel.js";
import { hashPassword } from "../helpers/encryptHelper.js";
import { config } from "../config/config.js";

// Ensure environment variables are loaded
configDotenv();

const seedAdmin = async () => {
  try {
    // 1. Connect to MongoDB using the URL from your config
    console.log(`Connecting to MongoDB at ${config.mongoUrl}...`);
    await mongoose.connect(config.mongoUrl);
    console.log("Connected to MongoDB successfully.");

    // 2. Define the admin credentials
    const adminEmail = "admin@nextmart.com";
    const plainPassword = "Password123!";

    // 3. Check if an admin with this email already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`⚠️ Admin user with email ${adminEmail} already exists! No new user was created.`);
    } else {
      // 4. Create the admin user if they don't exist
      const adminData = {
        name: "Super Admin",
        email: adminEmail,
        password: hashPassword(plainPassword), // Hash the password before saving
        role: "admin",
        isVerified: true, // Automatically verify the admin account
      };

      await User.create(adminData);
      console.log(`✅ Admin user successfully created!`);
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${plainPassword}`);
    }

    // 5. Disconnect from the database and exit
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
};

// Run the seeder function
seedAdmin();
