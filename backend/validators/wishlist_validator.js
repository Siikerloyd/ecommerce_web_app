const { z } = require("zod");

const AddWishlistSchema = z.object({
    product_id: z.number().int().positive()
}).strict();

module.exports = {
    AddWishlistSchema
};