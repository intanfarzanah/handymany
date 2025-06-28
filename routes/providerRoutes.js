const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');


// ✅ All providers
router.get('/', providerController.getProviders);

// ✅ Get all specializations
router.get('/specializations', providerController.getSpecializations);

// ✅ Single provider by numeric ID
router.get('/:id', providerController.getProviderById);


// ✅ Book provider by numeric ID
router.post('/:id/book', providerController.bookProvider);


module.exports = router;
