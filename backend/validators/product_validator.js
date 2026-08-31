const { z } = require("zod");

// SKU
const skuSchema = z
    .string()
    .trim()
    .toUpperCase()
    .min(6, "SKU must be at least 6 characters")
    .max(50, "SKU cannot exceed 50 characters")
    .regex(
        /^[A-Z0-9-]+$/,
        "SKU can only contain letters, numbers, and hyphens"
    );

// Name
const productNameSchema = z
    .string({
        required_error: "Product name is required",
        invalid_type_error: "Product name must be text",
    })
    .trim()
    .min(1, "Product name cannot be empty")
    .max(150, "Product name cannot exceed 150 characters");

// Description
const descriptionSchema = z
    .string({
        invalid_type_error: "Description must be text",
    })
    .trim()
    .optional();

// Price
const priceSchema = z
    .number({
        required_error: "Price is required",
        invalid_type_error: "Price must be a valid number",
    })
    .nonnegative("Price cannot be less than 0")
    .max(99999999.99, "Price exceeds maximum allowed limit")
    .multipleOf(0.01, "Price cannot have more than 2 decimal places");

// Stock quantity
const stockQuantitySchema = z
    .number({
        required_error: "Stock quantity is required",
        invalid_type_error: "Stock quantity must be a number",
    })
    .int("Stock quantity must be a whole number")
    .nonnegative("Stock quantity cannot be less than 0");

// Status
const productStatusSchema = z
    .enum(["ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"])
    .optional();

// Category ID
const categoryIdSchema = z
    .number()
    .int("Category ID must be an integer")
    .positive("Category ID must be positive")
    .optional();

// Brand ID
const brandIdSchema = z
    .number()
    .int("Brand ID must be an integer")
    .positive("Brand ID must be positive")
    .optional();

// Complete product schema
const CompleteProductSchema = z.object({
    sku: skuSchema,
    name: productNameSchema,
    description: descriptionSchema,
    price: priceSchema,
    stock_quantity: stockQuantitySchema,
    status: productStatusSchema,
    category_id: categoryIdSchema,
    brand_id: brandIdSchema,
});

//update product schema 
const UpdateProductSchema = CompleteProductSchema
    .partial()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be provided for update"
        }
    );

module.exports = {
    CompleteProductSchema,UpdateProductSchema
};