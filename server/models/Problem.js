import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['waste', 'electrical', 'water', 'street', 'other'],
    required: true
  },
  subCategory: String,
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  location: {
    ward: {
      type: Number,
      required: true
    },
    municipality: {
      type: String,
      required: true
    },
    exactLocation: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    landmark: String
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    isAnonymous: Boolean,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionDetails: {
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionImages: [String],
    resolutionDescription: String,
    costIncurred: Number
  },
  aiGeneratedData: {
    category: String,
    description: String,
    confidence: Number,
    duplicateCheck: {
      isDuplicate: Boolean,
      similarProblemId: mongoose.Schema.Types.ObjectId,
      similarityScore: Number
    }
  },
  tags: [String],
  estimatedResolutionTime: Date
}, {
  timestamps: true
});

// Index for geospatial queries
problemSchema.index({ 'location.coordinates': '2dsphere' });
problemSchema.index({ category: 1, status: 1 });
problemSchema.index({ createdAt: -1 });

export default mongoose.model('Problem', problemSchema);