import mongoose from 'mongoose';

interface IUser {
  username: string;
  email: string;
  password: string;
  bio?: string;
  links?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  // Field definitions
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
    bio: {
      type: String,
      maxlength: 280,
      default: '',
    },
    links: {
      type: [String],
      default: [],
      validate: {
        validator: function (links: string[]) {
          return links.length <= 4; // Max 4 links
        },
        message: 'Maximum 4 links allowed'
      }
    },
  },
  // Schema options
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);