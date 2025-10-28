
import { z } from "zod";
import { DayOfWeek } from "@prisma/client";

export const UpdateWeeklyAvailabilitySchema = z.object({
  id: z.string(),
  dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(), // HH:mm format
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(), // HH:mm format
});
