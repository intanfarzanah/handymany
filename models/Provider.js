const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  id: Number,
  name: String,
  specializations: [String],
  gender: String,
  price_rate_per_hour: Number,
  location: String,
  contact: String,
  booked: Boolean,
  verified: Boolean,
  isStudentPartner: Boolean,
  status: String,
  rating: Number,
  history: [String],
  availability: {
    unavailableDates: [String],
    timeSlotsPerDay: mongoose.Schema.Types.Mixed // can be an object with keys as dates
  },
  address: String,
  lat: Number,
  lng: Number
});


module.exports = mongoose.model('Provider', providerSchema);
