
const Provider = require('../models/Provider');

exports.getSpecializations = async (req, res) => {
  try {
    // Get distinct specializations only from providers who are not booked (available)
    const specializations = await Provider.distinct('specializations', { booked: false });
    res.json(specializations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch specializations' });
  }
};


// Get all providers
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find();
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
};


// Get provider by id
exports.getProviderById = async (req, res) => {
  try {
    const id = req.params.id; // in MongoDB, id is a string (_id)
    const provider = await Provider.findById(id);
    if (provider) {
      res.json(provider);
    } else {
      res.status(404).json({ error: 'Provider not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching provider' });
  }
};


// Book provider (mark as booked)
exports.bookProvider = async (req, res) => {
  try {
    const id = req.params.id;
    const { date, time } = req.body;


    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }


    if (provider.booked) {
      return res.status(400).json({ error: 'Provider already booked' });
    }


    // Mark provider as booked and store booking info (optional)
    provider.booked = true;


    // Optionally, you can store the booking date/time somewhere,
    // e.g. in a bookings array or update availability:
    // Here you could update provider.availability.timeSlotsPerDay to remove booked slot


    await provider.save();


    res.json({ message: 'Provider booked successfully', provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  }
};
