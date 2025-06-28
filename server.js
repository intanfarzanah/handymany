require('dotenv').config(); // Load environment variables


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');


const userRoutes = require('./routes/userRoutes');
const providerRoutes = require('./routes/providerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const protect = require('./middleware/auth'); // Import auth middleware


const app = express(); // Initialize express app


// Middleware
app.use(cors());
app.use(express.json());


// Log incoming requests (optional for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


// Routes
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/notifications', notificationRoutes);


// Run Python script manually (if needed)
app.get('/api/run-python', (req, res) => {
  const python = spawn('python', [path.join(__dirname, 'calendarbackend.py')]);


  python.stdout.on('data', (data) => {
    console.log(`Python Output: ${data}`);
  });


  python.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });


  python.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    res.json({ message: 'Python script finished running.' });
  });
});


// Flask: Get availability
app.get('/api/availability', async (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).json({ error: "Missing 'date' query param" });
  }


  try {
    const response = await axios.get(`http://localhost:5001/availability?date=${date}`);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching availability from Flask:", error);
    res.status(500).json({ error: "Error fetching availability" });
  }
});


const bookingRoutes = require('./routes/bookingRoutes');

// New endpoint: Get bookings filtered by date
// Removed forwarding to Flask backend, using local route instead

// Flask: Post booking
// Removed forwarding to Flask backend, using local route instead

// Use booking routes
app.use('/api/bookings', bookingRoutes);

// Serve static frontend from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));



// Redirect root to signup.html
app.get('/', (req, res) => {
  res.redirect('/signup.html');
});


// Start server on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
