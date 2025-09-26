import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import User model
import User from '../models/User';

async function resetAdminPassword() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('❌ MONGO_URI not found in .env file');
            process.exit(1);
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find admin user
        const adminEmail = 'admin@localhost';
        const newPassword = 'admin123';

        const adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            console.error('❌ Admin user not found');
            process.exit(1);
        }

        // Reset password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        adminUser.password = hashedPassword;
        adminUser.emailVerified = true; // Ensure email is verified
        adminUser.isAdmin = true; // Ensure admin status

        await adminUser.save();
        console.log('✅ Password reset successfully!');

        console.log('\n📧 Admin login details:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${newPassword}`);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run the script
resetAdminPassword();