const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// MongoDB connection (reuse existing connection if possible)
const client = mongoose.connection;

// Booking schema and model
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  serviceType: { type: String, required: true },
  notes: { type: String },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // e.g., "09:00 AM"
  status: { type: String, default: 'Pending' },
  created_at: { type: Date, default: Date.now },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Get bookings filtered by date
router.get('/', async (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ error: "Missing 'date' query param" });
  }
  try {
    const bookings = await Booking.find({ date }).select('-__v');
    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Error fetching bookings" });
  }
});

  // Create a new booking
  router.post('/', async (req, res) => {
    const data = req.body;
    console.log('Received booking data:', data);
    const requiredFields = ['name', 'email', 'phone', 'address', 'serviceType', 'date', 'time', 'providerId'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Check if time slot is already booked for the date
    try {
      const existing = await Booking.findOne({ date: data.date, time: data.time });
      if (existing) {
        return res.status(409).json({ error: "Time slot already booked for this date" });
      }

      const booking = new Booking({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        serviceType: data.serviceType,
        notes: data.notes || '',
        date: data.date,
        time: data.time,
        status: 'Pending',
        created_at: new Date(),
        providerId: data.providerId
      });

      await booking.save();

      res.status(201).json({ message: "Booking successful", booking });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Error creating booking" });
    }
  });

  // Get bookings by user email
  router.get('/user', async (req, res) => {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "Missing 'email' query param" });
    }
    try {
      const bookings = await Booking.find({ email }).select('-__v').populate({ path: 'providerId', model: 'Provider' });
      // Map providerId to provider for frontend convenience
      const bookingsWithProvider = bookings.map(booking => {
        const bookingObj = booking.toObject();
        bookingObj.provider = bookingObj.providerId;
        delete bookingObj.providerId;
        return bookingObj;
      });
      res.json({ bookings: bookingsWithProvider });
    } catch (error) {
      console.error("Error fetching bookings by user:", error);
      res.status(500).json({ error: "Error fetching bookings by user" });
    }
  });

const Notification = require('../models/Notification');

// Update booking status by booking ID
router.patch('/:id/status', async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Missing 'status' in request body" });
  }
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    booking.status = status;
    await booking.save();

    // Create notification based on status
    let message = null;
    switch (status) {
      case 'Accepted':
        message = `Your booking for ${booking.serviceType} has been accepted.`;
        break;
      case 'Provider Arriving':
        message = `Your service provider for ${booking.serviceType} is on the way.`;
        break;
      case 'In Progress':
        message = `Your service for ${booking.serviceType} is in progress.`;
        break;
      case 'Completed':
        message = `Your service for ${booking.serviceType} has been completed.`;
        break;
      case 'Cancelled':
        message = `Your booking for ${booking.serviceType} has been cancelled.`;
        break;
      default:
        break;
    }

    if (message) {
      const notification = new Notification({
        email: booking.email,
        message,
        createdAt: new Date(),
        read: false
      });
      await notification.save();
    }

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Error updating booking status" });
  }
});

module.exports = router;
