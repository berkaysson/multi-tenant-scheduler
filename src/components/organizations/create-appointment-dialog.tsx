"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar, Clock } from "lucide-react";
import dayjs from "dayjs";

import { createAppointment } from "@/actions/create-appointment";
import { getAppointmentTypes } from "@/actions/get-appointment-types";
import { CreateAppointmentSchema } from "@/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  description: string | null;
  color: string | null;
}

interface CreateAppointmentDialogProps {
  organizationId: string;
  date: string; // YYYY-MM-DD format
  hour: string; // HH:mm format
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DEFAULT_DURATION = 60; // 1 hour in minutes

export function CreateAppointmentDialog({
  organizationId,
  date,
  hour,
  open,
  onOpenChange,
  onSuccess,
}: CreateAppointmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const form = useForm<{
    appointmentTypeId?: string;
    title: string;
    description?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
  }>({
    resolver: zodResolver(
      CreateAppointmentSchema.omit({
        organizationId: true,
        startTime: true,
        endTime: true,
      })
    ),
    defaultValues: {
      appointmentTypeId: "",
      title: "",
      description: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open && organizationId) {
      fetchAppointmentTypes();
      // Reset form when dialog opens
      form.reset({
        appointmentTypeId: "",
        title: "",
        description: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        notes: "",
      });
    }
  }, [open, organizationId]);

  const fetchAppointmentTypes = async () => {
    setLoadingTypes(true);
    try {
      const result = await getAppointmentTypes(organizationId);
      if (result.success && result.appointmentTypes) {
        setAppointmentTypes(result.appointmentTypes);
      }
    } catch (error) {
      console.error("Error fetching appointment types:", error);
    } finally {
      setLoadingTypes(false);
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const start = dayjs(startTime);
    return start.add(duration, "minutes").toISOString();
  };

  const handleSubmit = async (data: {
    appointmentTypeId?: string;
    title: string;
    description?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
  }) => {
    if (!organizationId || !date || !hour) return;

    setLoading(true);

    try {
      // Calculate start and end times
      const [hourNum, minuteNum] = hour.split(":").map(Number);
      const startDateTime = dayjs(date)
        .hour(hourNum)
        .minute(minuteNum)
        .second(0)
        .millisecond(0)
        .toISOString();

      // Get duration from appointment type or use default
      const selectedType = appointmentTypes.find(
        (type) => type.id === data.appointmentTypeId
      );
      const duration = selectedType?.duration || DEFAULT_DURATION;
      const endDateTime = calculateEndTime(startDateTime, duration);

      const result = await createAppointment({
        organizationId,
        appointmentTypeId: data.appointmentTypeId && data.appointmentTypeId.trim() !== "" ? data.appointmentTypeId : undefined,
        title: data.title,
        description: data.description && data.description.trim() !== "" ? data.description : undefined,
        startTime: startDateTime,
        endTime: endDateTime,
        contactName: data.contactName && data.contactName.trim() !== "" ? data.contactName : undefined,
        contactEmail: data.contactEmail && data.contactEmail.trim() !== "" ? data.contactEmail : undefined,
        contactPhone: data.contactPhone && data.contactPhone.trim() !== "" ? data.contactPhone : undefined,
        notes: data.notes && data.notes.trim() !== "" ? data.notes : undefined,
      });

      if (result.success) {
        toast.success(result.message);
        form.reset();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = appointmentTypes.find(
    (type) => type.id === form.watch("appointmentTypeId")
  );
  const duration = selectedType?.duration || DEFAULT_DURATION;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>
            Book an appointment for {dayjs(date).format("MMMM D, YYYY")} at{" "}
            {dayjs(`2000-01-01 ${hour}`).format("h:mm A")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Appointment Type */}
            {appointmentTypes.length > 0 && (
              <FormField
                control={form.control}
                name="appointmentTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type (Optional)</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Default 1 hour)</SelectItem>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.duration} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Appointment title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the appointment"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration Info */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Duration: {duration} minutes ({dayjs(`2000-01-01 ${hour}`).format("h:mm A")} - {dayjs(`2000-01-01 ${hour}`).add(duration, "minutes").format("h:mm A")})
              </span>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Contact Information (Optional)</h3>
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes"
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Appointment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

