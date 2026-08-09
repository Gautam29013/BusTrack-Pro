const mongoose = require('mongoose');

const busLocationSchema = new mongoose.Schema(
  {
    busId: {
      type: String,
      required: true,
      index: true,
    },
    busNumber: {
      type: String,
      required: true,
    },
    routeId: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    speed: {
      type: Number,
      default: 0,
      min: 0,
      max: 200,
    },
    heading: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },
    nextStopId: {
      type: String,
      default: null,
    },
    nextStopName: {
      type: String,
      default: null,
    },
    passengerCount: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: { expires: '24h' }, // TTL — auto-delete after 24 hours
    },
  },
  {
    collection: 'bus_locations',
  }
);

// Compound index for fast latest-location queries
busLocationSchema.index({ busId: 1, timestamp: -1 });

module.exports = mongoose.model('BusLocation', busLocationSchema);
