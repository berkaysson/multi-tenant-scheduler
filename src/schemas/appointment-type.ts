import { z } from "zod";

export const CreateAppointmentTypeSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().optional(),
  duration: z.number().int().min(1, "Duration must be at least 1 minute").max(1440, "Duration cannot exceed 24 hours"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #FF5733)").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const UpdateAppointmentTypeSchema = z.object({
  id: z.string().min(1, "Appointment type ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
  description: z.string().optional(),
  duration: z.number().int().min(1, "Duration must be at least 1 minute").max(1440, "Duration cannot exceed 24 hours").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #FF5733)").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

