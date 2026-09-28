const notificationService=require('../../notifications/services/notificationsService.js');

exports.getNotifications = async (req, res) => {
    const userId = req.user.user_id;

    const result = await notificationService.getNotifications(userId);

    res.status(200).json({
        message: "Notifications retrieved successfully",
        result
    });
};

exports.getNotificationById = async (req, res) => {
    const userId = req.user.user_id;
    const notificationId = req.params.notificationId;

    const result = await notificationService.getNotificationById(
        notificationId,
        userId
    );

    res.status(200).json({
        message: "Notification retrieved successfully",
        result
    });
};


exports.deleteNotification = async (req, res) => {
    const userId = req.user.user_id;
    const notificationId = req.params.notificationId;

    const result = await notificationService.deleteNotification(
        notificationId,
        userId
    );

    res.status(200).json({
        message: "Notification deleted successfully",
        result
    });
};