const { z } = require("zod");

// Category name
const categoryNameSchema = z
    .string({
        required_error: "Category name is required",
        invalid_type_error: "Category name must be text",
    })
    .trim()
    .min(1, "Category name cannot be empty")
    .max(100, "Category name cannot exceed 100 characters");

// Description
const descriptionSchema = z
    .string({
        invalid_type_error: "Description must be text",
    })
    .trim()
    .optional();

// Parent category ID
const categoryIdSchema = z
    .number()
    .int("Category ID must be an integer")
    .positive("Category ID must be positive")
    .nullable()
    .optional();


const CompleteCategorySchema = z.object({
    category_name: categoryNameSchema,
    description: descriptionSchema,
    parent_category_id: categoryIdSchema,
});

const UpdateCategorySchema = CompleteCategorySchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be provided for update"
        }
    );

    module.exports={CompleteCategorySchema,UpdateCategorySchema};