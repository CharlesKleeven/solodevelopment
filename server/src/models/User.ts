import mongoose from 'mongoose';

interface IUser {
  username: string;
  email: string;
  password?: string; // Optional for OAuth users
  displayName: string; // Required now, not optional
  bio?: string;
  links?: string[];
  profileVisibility: 'public' | 'private';
  
  // OAuth fields
  googleId?: string;
  discordId?: string;
  provider: 'local' | 'google' | 'discord' | 'mixed'; // Track auth method
  
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
    
    // OAuth fields
    googleId: {
      type: String,
      sparse: true, // Allows null values but ensures uniqueness when present
    },
    discordId: {
      type: String,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'discord', 'mixed'],
      default: 'local'
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

export default mongoose.model<IUser>('User', userSchema);