import { z } from "zod";

export const UnavailableDateSchema = z.object({
  date: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    { message: "Invalid date format" }
  ),
  reason: z.string().optional(),
});

export const CreateUnavailableDateSchema = z.object({
  organizationId: z.string(),
  date: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    { message: "Invalid date format" }
  ),
  reason: z.string().optional(),
});

export const DeleteUnavailableDateSchema = z.object({
  id: z.string(),
});

