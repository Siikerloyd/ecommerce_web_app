const { z } = require("zod");
const imageUrlSchema = z
    .string()
    .trim()
    .url({ message: "image_url must be a valid URL" })
    .max(255, { message: "image_url must be at most 255 characters" })
    .refine(
        (url) =>
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                new URL(url).pathname
            ),
        {
            message: "image_url must point to an image file",
        }
    );

const CreateProductImageSchema = z.object({
    image_url: imageUrlSchema,
    is_primary: z.boolean().optional()
}).strict();

const UpdateProductImageSchema = z.object({
    image_url: imageUrlSchema.optional(),
    is_primary: z.boolean().optional()
}).strict();

module.exports={CreateProductImageSchema,UpdateProductImageSchema};