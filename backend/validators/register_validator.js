
const { z } = require("zod");

// First name schema
const FirstNameSchema = z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters");

// Last name schema
const LastNameSchema = z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters");

// Email schema
const EmailSchema = z
    .string()
    .trim()
    .email("Invalid email address format")
    .toLowerCase();

// Phone number schema
// Phone number schema
const PhoneSchema = z
    .string()
    .trim()
    .min(8, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(
        /^[0-9\s()+-]+$/,
        "Phone number contains invalid characters"
    )
    .transform((val) => val.replace(/[\s()+-]/g, ""));

// Password schema
const PasswordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password cannot exceed 255 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character (e.g., !, @, #, $)"
    );

// User role schema
const UserRoleSchema = z.enum(
    ["CUSTOMER", "ADMIN", "DELIVERY"],
    {
        errorMap: () => ({
            message: "Role must be either CUSTOMER, ADMIN, or DELIVERY"
        })
    }
);

// Complete registration schema
const CompleteUserSchema = z.object({
    first_name: FirstNameSchema,
    last_name: LastNameSchema,
    email: EmailSchema,
    phone_number: PhoneSchema,
    password: PasswordSchema,
    role: UserRoleSchema
});

module.exports = CompleteUserSchema;

