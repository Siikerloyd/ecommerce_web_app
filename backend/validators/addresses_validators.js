const { z } = require("zod");

const titleSchema = z
    .string()
    .trim()
    .min(1, { message: "title is required" })
    .max(50, { message: "title must be at most 50 characters" });

const streetSchema = z
    .string()
    .trim()
    .min(1, { message: "street is required" })
    .max(150, { message: "street must be at most 150 characters" });

const citySchema = z
    .string()
    .trim()
    .min(1, { message: "city is required" })
    .max(50, { message: "city must be at most 50 characters" });

const postalCodeSchema = z
    .string()
    .trim()
    .min(1, { message: "postal_code is required" })
    .max(20, { message: "postal_code must be at most 20 characters" });

const countrySchema = z
    .string()
    .trim()
    .min(1, { message: "country is required" })
    .max(50, { message: "country must be at most 50 characters" });

const phoneNumberSchema = z
    .string()
    .trim()
    .regex(
        /^[0-9\s()+-]+$/,
        "Phone number contains invalid characters"
    )
    .transform((val) => val.replace(/[\s()+-]/g, ""))
    .refine(
        (val) => val.length >= 8,
        "Phone number is too short"
    )
    .refine(
        (val) => val.length <= 20,
        "Phone number is too long"
    );

const CreateAddressSchema = z.object({
    title: titleSchema,
    street: streetSchema,
    city: citySchema,
    postal_code: postalCodeSchema,
    country: countrySchema,
    phone_number: phoneNumberSchema,
    is_default: z.boolean().optional()
}).strict();


const UpdateAddressSchema = z.object({
    title: titleSchema.optional(),
    street: streetSchema.optional(),
    city: citySchema.optional(),
    postal_code: postalCodeSchema.optional(),
    country: countrySchema.optional(),
    phone_number: phoneNumberSchema.optional(),
    is_default: z.boolean().optional()
}).strict();



module.exports = {
    CreateAddressSchema,UpdateAddressSchema
};