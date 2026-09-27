const { z } = require("zod");

const CreateOrderSchema = z.object({
    address_id: z.number().int().positive()
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