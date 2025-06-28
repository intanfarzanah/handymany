const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// POST /api/notifications - create notification
router.post('/', notificationController.createNotification);

// GET /api/notifications?email= - get notifications by email
router.get('/', notificationController.getNotificationsByEmail);

module.exports = router;
