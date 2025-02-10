const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxLength: [100, 'Event name cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxLength: [200, 'Subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    from: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time in HH:MM format']
    },
    to: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time in HH:MM format']
    }
  },
  organization: {
    type: String,
    trim: true
  },
  buttonText: {
    type: String,
    default: 'Register Now',
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isFeatured: {
      type: Boolean,
      default: false
    }
  }],
  speakers: [{
    name: {
      type: String,
      required: true
    },
    bio: String,
    image: String,
    designation: String,
    social: {
      linkedin: String,
      twitter: String,
      website: String
    }
  }],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  venue: {
    name: {
      type: String,
      required: [true, 'Venue name is required']
    },
    address: {
      type: String,
      required: [true, 'Venue address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ isPrivate: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;