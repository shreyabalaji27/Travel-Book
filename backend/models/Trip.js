// models/Trip.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Mumbai to Delhi - Flight"
  type: { type: String, enum: ['flight','train','cab','other'], default: 'other' },
  origin: String,
  destination: String,
  departure: Date,
  arrival: Date,
  price: Number,
  seatsAvailable: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
