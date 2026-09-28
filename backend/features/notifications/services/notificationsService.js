const pool=require('../../../config/connect_database.js');
const AppError=require('../../../utils/AppError.js');

exports.getNotifications = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            notification_id,
            type,
            message,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};


exports.getNotificationById = async (notificationId, userId) => {
    try {
        const result = await pool.query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = $1
            AND user_id = $2
            RETURNING *
            `,
            [notificationId, userId]
        );

        if (result.rowCount === 0) {
            throw new AppError("Notification not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid notification ID", 400);
        }

        throw error;
    }
};

exports.deleteNotification = async (notificationId, userId) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM notifications
            WHERE notification_id = $1
            AND user_id = $2
            RETURNING *
            `,
            [notificationId, userId]
        );

        if (result.rowCount === 0) {
            throw new AppError("Notification not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        if (error.code === "22P02") {
            throw new AppError("Invalid notification ID", 400);
        }

        throw error;
    }
};