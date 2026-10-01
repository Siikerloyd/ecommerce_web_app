/*
6. PATCH  /delivery/status             → delivery updates availability
*/
//imports
const verifyToken=require('../../middleware/authMiddleware.js');
const {verifyRole}=require('../../middleware/authorization.js');
const deliveryController=require('../controller/deliveryControllers.js');
const validate=require('../../middleware/validate.js');
const updateDeliveryStatusSchema=require('../../../validators/update_delivery_status.js');

const express = require('express');
const router = express.Router();

//Admin:

router.get('/delivery',verifyToken,verifyRole('ADMIN'),deliveryController.allDelivery);
router.get(
    '/orders/:orderId/delivery',
    verifyToken,
    verifyRole('ADMIN'),
    deliveryController.whoAssignedToDeliver
);
router.patch(
    "/orders/:orderId/delivery",
    verifyToken,
    verifyRole("ADMIN"),
    deliveryController.manageaOrders
);
//Delivery:
router.get(
    "/delivery/me",
    verifyToken,
    verifyRole("DELIVERY"),
    deliveryController.getMyDeliveryProfile
);
router.get('/delivery/orders',verifyToken,verifyRole("DELIVERY"),deliveryController.getDeliveryAssignedOrders);

router.get('/delivery/orders/:orderId',verifyToken,verifyRole('DELIVERY'),deliveryController.getmyassignedorder);
router.patch(
    "/delivery/status",
    verifyToken,
    verifyRole("DELIVERY"),
    validate(updateDeliveryStatusSchema),
    deliveryController.updateMyStatus
);

module.exports = router;
