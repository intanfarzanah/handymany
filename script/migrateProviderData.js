const mongoose = require('mongoose');
const Provider = require('../models/Provider');
const providers = require('../static/ProviderData');


require('dotenv').config();


async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');


    for (const providerData of providers) {
      const filter = { name: providerData.name }; // Assuming name is unique
      const update = {
        id: providerData.id,
        specializations: providerData.specializations,
        location: providerData.location,
        contact: providerData.contact,
        booked: providerData.booked,
        verified: providerData.verified,
        isStudentPartner: providerData.isStudentPartner,
        status: providerData.status || '',
        rating: providerData.rating,
        history: providerData.history,
        availability: providerData.availability,
        address: providerData.address,
        lat: providerData.lat,
        lng: providerData.lng,
        gender: providerData.gender,
        price_rate_per_hour: providerData.price_rate_per_hour
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };


      const result = await Provider.findOneAndUpdate(filter, update, options);
      console.log(`Upserted provider: ${result.name}`);
    }


    console.log('Migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}


migrate();
