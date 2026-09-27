const express = require('express');
const router = express.Router();

const verifyToken = require('../../middleware/authMiddleware.js');
const orderController = require('../controllers/ordersController.js');
const {CreateOrderSchema,UpdateOrderStatusSchema}=require('../../../validators/orders_validator.js');
const validate=require('../../middleware/validate.js');
const { verifyRole } = require('../../middleware/authorization.js');

router.get(
    "/orders",
    verifyToken,
    orderController.getOrders
);

router.get(
    "/orders/:orderId",
    verifyToken,
    orderController.getOrderById
);

router.post(
    "/orders",
    verifyToken,
    validate(CreateOrderSchema),
    orderController.createOrder
);
router.patch("/orders/:orderId/status",verifyToken,verifyRole("ADMIN"),validate(UpdateOrderStatusSchema),orderController.updateOrderStatus);
module.exports = router;