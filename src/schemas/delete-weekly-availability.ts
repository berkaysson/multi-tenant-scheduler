
import { z } from "zod";

export const DeleteWeeklyAvailabilitySchema = z.object({
  id: z.string(),
});
