import mongoose from 'mongoose';

interface IUser {
  username: string;
  email: string;
  password: string;
  displayName: string; // Required now, not optional
  bio?: string;
  links?: string[];
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
      required: true,
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