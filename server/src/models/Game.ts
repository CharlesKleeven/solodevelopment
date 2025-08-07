import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IGame extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  screenshots: string[];
  videoUrl?: string;
  playUrl?: string;
  sourceUrl?: string;
  devlogUrl?: string;
  tags: string[];
  engine: string;
  platforms: string[];
  jamEntry: boolean;
  jamName?: string;
  jamPlacement?: number;
  user: mongoose.Types.ObjectId;
  visibility: 'public' | 'unlisted' | 'private' | 'pending';
  views: number;
  isAdult?: boolean;
  reported?: boolean;
  reportCount?: number;
  createdAt: Date;
  updatedAt: Date;
  canModify(userId: string): boolean;
  incrementViews(): Promise<void>;
}

const GameSchema = new Schema<IGame>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 160
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        // Allow Firebase Storage URLs or existing HTTPS URLs
        if (v.startsWith('https://firebasestorage.googleapis.com/')) {
          return true;
        }
        // Allow relative paths for legacy data
        if (v.startsWith('/images/')) {
          return true;
        }
        try {
          const url = new URL(v);
          return url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      message: 'Thumbnail URL must be a valid HTTPS URL or Firebase Storage URL'
    }
  },
  screenshots: [{
    type: String,
    validate: {
      validator: function(v: string) {
        try {
          const url = new URL(v);
          return url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      message: 'Screenshot URLs must be valid HTTPS URLs'
    }
  }],
  videoUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        try {
          const url = new URL(v);
          const allowedHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com'];
          return url.protocol === 'https:' && 
                 allowedHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host));
        } catch {
          return false;
        }
      },
      message: 'Video URL must be a valid HTTPS YouTube or Vimeo URL'
    }
  },
  playUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        try {
          const url = new URL(v);
          return url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      message: 'Play URL must be a valid HTTPS URL'
    }
  },
  sourceUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        try {
          const url = new URL(v);
          return url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      message: 'Source URL must be a valid HTTPS URL'
    }
  },
  devlogUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        try {
          const url = new URL(v);
          return url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      message: 'Devlog URL must be a valid HTTPS URL'
    }
  },
  tags: [{
    type: String,
    enum: [
      'action', 'adventure', 'arcade', 'puzzle', 'platformer', 
      'rpg', 'strategy', 'simulation', 'horror', 'survival',
      'multiplayer', 'singleplayer', 'coop', 'competitive',
      '2d', '3d', 'pixel-art', 'low-poly', 'retro', 'modern',
      'casual', 'hardcore', 'family-friendly', 'mature',
      'jam-game', 'prototype', 'demo', 'full-game'
    ]
  }],
  engine: {
    type: String,
    enum: ['unity', 'unreal', 'godot', 'gamemaker', 'construct', 'phaser', 'love2d', 'pygame', 'custom', 'other'],
    default: 'other'
  },
  platforms: [{
    type: String,
    enum: ['web', 'windows', 'mac', 'linux', 'android', 'ios', 'playstation', 'xbox', 'nintendo-switch', 'other']
  }],
  jamEntry: {
    type: Boolean,
    default: false
  },
  jamName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  jamPlacement: {
    type: Number,
    min: 1,
    max: 1000
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private', 'pending'],
    default: 'public'
  },
  views: {
    type: Number,
    default: 0
  },
  isAdult: {
    type: Boolean,
    default: false
  },
  reported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
GameSchema.pre('save', async function(this: IGame) {
  if (this.isModified('title') || this.isNew) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug exists for this user and generate a unique one if needed
    while (true) {
      const existingGame = await mongoose.model('Game').findOne({
        slug: slug,
        user: this.user,
        _id: { $ne: this._id } // Exclude current game when updating
      });
      
      if (!existingGame) {
        this.slug = slug;
        break;
      }
      
      // Add counter to make it unique
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
});

// Method to check if user can modify this game
GameSchema.methods.canModify = function(this: IGame, userId: string): boolean {
  return this.user.toString() === userId;
};

// Method to increment views
GameSchema.methods.incrementViews = async function(this: IGame): Promise<void> {
  this.views += 1;
  await this.save();
};

// Ensure slug uniqueness per user (compound index)
GameSchema.index({ user: 1, slug: 1 }, { unique: true });
GameSchema.index({ user: 1, createdAt: -1 });
GameSchema.index({ visibility: 1, createdAt: -1 });
GameSchema.index({ tags: 1 });

const Game = mongoose.model<IGame>('Game', GameSchema);

export default Game;