const { z } = require("zod");

const brandNameSchema = z
    .string()
    .trim()
    .min(1, { message: "brand_name is required" })
    .max(100, { message: "brand_name must be at most 100 characters" });

const brandUrlSchema = z
    .string()
    .trim()
    .url({ message: "logo_url must be a valid URL" })
    .max(255, { message: "logo_url must be at most 255 characters" })
    .refine(
        (url) =>
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
                new URL(url).pathname
            ),
        {
            message: "logo_url must point to an image file",
        }
    )
    .nullable()
    .optional();

const CompleteBrandSchema = z.object({
    brand_name: brandNameSchema,
    logo_url: brandUrlSchema
})
.strict();
const UpdateBrandSchema = z.object({
    brand_name: brandNameSchema.optional(),
    logo_url: brandUrlSchema,
}).strict();

module.exports = {CompleteBrandSchema,UpdateBrandSchema};