const express = require('express');
const router = express.Router();
const verifyToken = require('../../middleware/authMiddleware.js');
const notificationController=require('../controller/notificationsController.js');

router.get(
    "/notifications",
    verifyToken,
    notificationController.getNotifications
);

router.get(
    "/notifications/:notificationId",
    verifyToken,
    notificationController.getNotificationById
);

router.delete(
    "/notifications/:notificationId",
    verifyToken,
    notificationController.deleteNotification
);

module.exports = router;