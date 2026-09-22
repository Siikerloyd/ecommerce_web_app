const { z } = require("zod");

const AddCartItemSchema = z.object({
    product_id: z.number().int().positive(),
    quantity: z.number().int().positive()
}).strict();



const UpdateCartItemSchema = z.object({
    quantity: z.number().int().positive()
}).strict();

module.exports = {
    AddCartItemSchema,
    UpdateCartItemSchema
};