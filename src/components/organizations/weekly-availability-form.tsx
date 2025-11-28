"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { DayOfWeek } from "@prisma/client";

import { createWeeklyAvailability } from "@/actions/organization/create-weekly-availability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface WeeklyAvailability {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

interface WeeklyAvailabilityFormProps {
  organizationId: string;
  weeklyAvailability: WeeklyAvailability[];
  onUpdate?: () => void;
}

type DayConfig = {
  value: DayOfWeek;
  label: string;
};

const DAYS_OF_WEEK: DayConfig[] = [
  { value: DayOfWeek.MONDAY, label: "Monday" },
  { value: DayOfWeek.TUESDAY, label: "Tuesday" },
  { value: DayOfWeek.WEDNESDAY, label: "Wednesday" },
  { value: DayOfWeek.THURSDAY, label: "Thursday" },
  { value: DayOfWeek.FRIDAY, label: "Friday" },
  { value: DayOfWeek.SATURDAY, label: "Saturday" },
  { value: DayOfWeek.SUNDAY, label: "Sunday" },
];

const FormSchema = z.object({
  availabilities: z.array(
    z
      .object({
        dayOfWeek: z.nativeEnum(DayOfWeek),
        startTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
        endTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
        enabled: z.boolean(),
      })
      .refine(
        (data) => {
          if (!data.enabled) return true;
          const [startHour, startMin] = data.startTime.split(":").map(Number);
          const [endHour, endMin] = data.endTime.split(":").map(Number);
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          return endMinutes > startMinutes;
        },
        {
          message: "End time must be after start time",
          path: ["endTime"],
        }
      )
  ),
});

type FormData = z.infer<typeof FormSchema>;

export function WeeklyAvailabilityForm({
  organizationId,
  weeklyAvailability: initialWeeklyAvailability,
  onUpdate,
}: WeeklyAvailabilityFormProps) {
  const [loading, setLoading] = useState(false);

  const availabilityMap = new Map<DayOfWeek, WeeklyAvailability>();
  initialWeeklyAvailability.forEach((avail) => {
    availabilityMap.set(avail.dayOfWeek, avail);
  });

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      availabilities: DAYS_OF_WEEK.map((day) => {
        const existing = availabilityMap.get(day.value);
        return {
          dayOfWeek: day.value,
          startTime: existing?.startTime || "09:00",
          endTime: existing?.endTime || "17:00",
          enabled: !!existing,
        };
      }),
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const enabledAvailabilities = data.availabilities
      .filter((avail) => avail.enabled)
      .map(({ enabled, ...rest }) => rest);

    const result = await createWeeklyAvailability({
      organizationId,
      availabilities: enabledAvailabilities,
    });

    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      if (onUpdate) {
        onUpdate();
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day, index) => (
                <div
                  key={day.value}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`availabilities.${index}.enabled`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0 w-full sm:w-auto sm:min-w-[120px]">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-medium cursor-pointer">
                          {day.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2 flex-1 w-full flex-col sm:flex-row">
                    <FormField
                      control={form.control}
                      name={`availabilities.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Start Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              disabled={
                                !form.watch(`availabilities.${index}.enabled`)
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <span className="pt-5">-</span>

                    <FormField
                      control={form.control}
                      name={`availabilities.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">End Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              disabled={
                                !form.watch(`availabilities.${index}.enabled`)
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Availability
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
