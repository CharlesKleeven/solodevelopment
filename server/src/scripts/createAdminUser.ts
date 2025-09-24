import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import User model
import User from '../models/User';

async function createAdminUser() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('❌ MONGO_URI not found in .env file');
            console.log('\nPlease set up your .env file with:');
            console.log('MONGO_URI=mongodb://localhost:27017/solodevelopment');
            console.log('or');
            console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname');
            process.exit(1);
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Admin user details
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@solodevelopment.local';
        const adminUsername = 'admin';
        const adminPassword = 'admin123'; // Change this in production!

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            $or: [
                { email: adminEmail },
                { username: adminUsername }
            ]
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');

            // Update to make sure they're an admin
            if (!existingAdmin.isAdmin) {
                existingAdmin.isAdmin = true;
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin');
            }

            console.log('\n📧 Admin login details:');
            console.log(`Email: ${existingAdmin.email}`);
            console.log(`Username: ${existingAdmin.username}`);
            console.log(`Password: (use your existing password)`);

        } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            // Create admin user
            const adminUser = new User({
                username: adminUsername,
                email: adminEmail,
                password: hashedPassword,
                displayName: 'Admin',
                bio: 'Site Administrator',
                profileVisibility: 'public',
                isAdmin: true,
                provider: 'local',
                emailVerified: true, // Skip email verification for admin
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await adminUser.save();
            console.log('✅ Admin user created successfully!');

            console.log('\n📧 Admin login details:');
            console.log(`Email: ${adminEmail}`);
            console.log(`Username: ${adminUsername}`);
            console.log(`Password: ${adminPassword}`);
            console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Run the script
createAdminUser();