import mongoose from 'mongoose';

interface IUser {
  username: string;
  email: string;
  password?: string; // Optional for OAuth users
  displayName: string; // Required now, not optional
  bio?: string;
  links?: string[];
  profileVisibility: 'public' | 'private';
  isAdmin?: boolean; // Admin flag
  
  // OAuth fields
  googleId?: string;
  discordId?: string;
  itchioId?: string;
  provider: 'local' | 'google' | 'discord' | 'itchio' | 'mixed'; // Track auth method
  
  // Email verification fields
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Optional for OAuth users
      minlength: 6,
    },
    displayName: {
      type: String,
      required: true, // Make it required
      trim: true,
      minlength: 1,
      maxlength: 20,
      // Default to username if not provided
      default: function (this: IUser) {
        return this.username;
      }
    },
    bio: {
      type: String,
      maxlength: 280,
      default: ''
    },
    links: [{
      type: String,
      maxlength: 500, // Increased to accommodate JSON storage
    }],
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    
    // OAuth fields
    googleId: {
      type: String,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    discordId: {
      type: String,
      sparse: true,
    },
    itchioId: {
      type: String,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'discord', 'itchio', 'mixed'],
      default: 'local'
    },
    
    // Email verification fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to ensure displayName is always set
userSchema.pre('save', function (next) {
  // If displayName is empty or just whitespace, set it to username
  if (!this.displayName || this.displayName.trim() === '') {
    this.displayName = this.username;
  }
  next();
});

// Create compound index for public profile queries
userSchema.index({ profileVisibility: 1, createdAt: -1 });

// Create index for OAuth provider lookups (already handled by sparse: true in schema)
// No additional indexes needed here since sparse indexes are defined in the schema above

export default mongoose.model<IUser>('User', userSchema);