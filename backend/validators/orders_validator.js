const { z } = require("zod");

const CreateOrderSchema = z.object({
    address_id: z.number().int().positive(),
    payment_method: z.enum([
        "CASH_ON_DELIVERY",
        "CREDIT_CARD",
        "PAYPAL"
    ]).default("CASH_ON_DELIVERY")
}).strict();

const UpdateOrderStatusSchema = z.object({
    status: z.enum([
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED"
    ])
}).strict();




module.exports = {
    CreateOrderSchema,
    UpdateOrderStatusSchema
};