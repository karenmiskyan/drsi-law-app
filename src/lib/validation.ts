import { z } from "zod";

// Step 1: Contact Info validation
export const contactInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase(),
  phone: z
    .string()
    .regex(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      "Please enter a valid phone number"
    ),
});

export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;

// Step 2: Marital Status validation
export const maritalStatusSchema = z.object({
  maritalStatus: z.enum([
    "single",
    "married",
    "married_to_citizen",
    "divorced",
    "widowed",
    "legally_separated",
  ]),
});

export type MaritalStatusFormData = z.infer<typeof maritalStatusSchema>;

// Step 3: Contract Signing validation
export const contractSigningSchema = z.object({
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  signature: z.string().min(1, "Signature is required"),
});

export type ContractSigningFormData = z.infer<typeof contractSigningSchema>;

