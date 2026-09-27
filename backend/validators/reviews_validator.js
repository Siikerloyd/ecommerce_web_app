const { z } = require("zod");

const CreateReviewSchema = z.object({
    product_id: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional()
}).strict();

const UpdateReviewSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(2000).optional()
}).strict().refine(
    data => data.rating !== undefined || data.comment !== undefined,
    {
        message: "At least one field must be provided"
    }
);

module.exports = {
    CreateReviewSchema,
    UpdateReviewSchema
};