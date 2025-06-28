// seed.js
const mongoose = require('mongoose');
const Provider = require('./models/Provider');
const providers = require('./static/ProviderData'); // Move your array here and export it


mongoose.connect('mongodb://localhost:27017/HandyManyApp')
  .then(async () => {
    // 🔥 Delete all existing providers first
    await Provider.deleteMany({});
    console.log('Old providers removed');


    // ✅ Insert new data
    await Provider.insertMany(providers);
    console.log('New providers inserted');


    mongoose.connection.close();
  })


  .catch((err) => {
    console.error(err);
  });