
import mongoose from 'mongoose';

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const ticketClassSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ['standard', 'premium', 'first']
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: 0
    },
    amenities: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    availableDays: {
      type: [String],
      enum: DAYS_OF_WEEK,
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'ticketClasses'
  }
);

const TicketClass = mongoose.model('TicketClass', ticketClassSchema);

export default TicketClass;
