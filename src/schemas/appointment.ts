import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  appointmentTypeId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"), // ISO string
  endTime: z.string().min(1, "End time is required"), // ISO string
  contactName: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

