import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to normalize Gmail addresses
function normalizeGmailAddress(email: string): string {
  if (!email) return email;
  
  const [localPart, domain] = email.toLowerCase().split('@');
  
  // Only normalize Gmail addresses
  if (domain === 'gmail.com') {
    // Remove dots from local part and ignore everything after +
    const normalizedLocal = localPart.replace(/\./g, '').split('+')[0];
    return `${normalizedLocal}@${domain}`;
  }
  
  // For non-Gmail addresses, just lowercase
  return email.toLowerCase();
}

async function normalizeGmailAddresses() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/your-database-name';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all users with Gmail addresses
    const gmailUsers = await User.find({ 
      email: { $regex: /@gmail\.com$/i } 
    });

    console.log(`Found ${gmailUsers.length} Gmail users`);

    let normalizedCount = 0;

    for (const user of gmailUsers) {
      const originalEmail = user.email;
      const normalizedEmail = normalizeGmailAddress(originalEmail);

      if (originalEmail !== normalizedEmail) {
        console.log(`Normalizing: ${originalEmail} → ${normalizedEmail}`);
        
        // Check if normalized email already exists
        const conflictUser = await User.findOne({ 
          email: normalizedEmail,
          _id: { $ne: user._id } // Exclude current user
        });

        if (conflictUser) {
          console.log(`⚠️  Conflict detected: ${normalizedEmail} already exists for user ${conflictUser.username}`);
          console.log(`   Skipping normalization for user ${user.username}`);
          continue;
        }

        // Update user email
        user.email = normalizedEmail;
        await user.save();
        normalizedCount++;
      }
    }

    console.log(`✅ Successfully normalized ${normalizedCount} Gmail addresses`);
    
  } catch (error) {
    console.error('❌ Error normalizing Gmail addresses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  normalizeGmailAddresses();
}

export default normalizeGmailAddresses;