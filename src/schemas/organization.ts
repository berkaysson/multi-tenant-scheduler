import * as z from "zod";

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100, "Name must be less than 100 characters"),
  slug: z.string()
    .min(1, "Slug is required")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().default("Europe/Istanbul"),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
});

export const UpdateOrganizationSchema = z.object({
  id: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Organization name is required").max(100, "Name must be less than 100 characters").optional(),
  slug: z.string()
    .min(1, "Slug is required")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});
