
import { z } from "zod";
import { DayOfWeek } from "@prisma/client";

export const WeeklyAvailabilitySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm format
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:mm format
});

export const CreateWeeklyAvailabilitySchema = z.object({
  organizationId: z.string(),
  availabilities: z.array(WeeklyAvailabilitySchema),
});
