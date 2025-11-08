"use client";

import { useEffect, useState } from "react";
import { getAppointmentsByDate } from "@/actions/get-appointments-by-date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { CreateAppointmentDialog } from "./create-appointment-dialog";

interface WeeklyAvailability {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface Appointment {
  id: string;
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
  appointmentType: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface OrganizationHoursDialogProps {
  date: string | null;
  weeklyAvailability: WeeklyAvailability[];
  organizationId: string | null;
  isOwner?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationHoursDialog({
  date,
  weeklyAvailability,
  organizationId,
  isOwner = false,
  open,
  onOpenChange,
}: OrganizationHoursDialogProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (open && date && organizationId) {
      fetchAppointments();
    } else {
      setAppointments([]);
    }
  }, [open, date, organizationId]);

  const fetchAppointments = async () => {
    if (!date || !organizationId) return;

    setLoading(true);
    try {
      const result = await getAppointmentsByDate(organizationId, date);
      if (result.success && result.appointments) {
        setAppointments(result.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Get day of week index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const getDayOfWeekIndex = (dayOfWeek: string): number => {
    const dayMap: { [key: string]: number } = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };
    return dayMap[dayOfWeek] ?? -1;
  };

  // Generate hours based on weekly availability
  const generateHoursForDate = (dateStr: string): string[] => {
    const date = dayjs(dateStr);
    const dayIndex = date.day(); // 0 = Sunday, 1 = Monday, etc.
    const availability = weeklyAvailability.find(
      (avail) => getDayOfWeekIndex(avail.dayOfWeek) === dayIndex
    );

    if (!availability) {
      return [];
    }

    const hours: string[] = [];
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    const start = dayjs().hour(startHour).minute(startMinute);
    const end = dayjs().hour(endHour).minute(endMinute);

    let current = start;
    while (current.isBefore(end) || current.isSame(end)) {
      hours.push(current.format("HH:mm"));
      current = current.add(1, "hour");
    }

    return hours;
  };

  // Get appointments for a specific hour
  const getAppointmentsForHour = (hour: string): Appointment[] => {
    if (!date) return [];

    const [hourNum, minuteNum] = hour.split(':').map(Number);
    const hourStart = dayjs(date).hour(hourNum).minute(minuteNum);
    const hourEnd = hourStart.add(1, "hour");

    return appointments.filter((apt) => {
      const aptStart = dayjs(apt.startTime);
      // Check if appointment starts during this hour or overlaps with it
      return (aptStart.isAfter(hourStart) || aptStart.isSame(hourStart)) && aptStart.isBefore(hourEnd);
    });
  };

  const handleHourClick = (hour: string) => {
    // If user owns the organization, don't allow booking (read-only view)
    if (isOwner) return;
    
    if (!organizationId || !date) return;
    setSelectedHour(hour);
    setShowCreateDialog(true);
  };

  const handleAppointmentCreated = () => {
    // Refresh appointments after creation
    fetchAppointments();
  };

  if (!date) {
    return null;
  }

  const hours = generateHoursForDate(date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isOwner ? "Appointments" : "Available Hours"} - {dayjs(date).format("MMMM D, YYYY")}
          </DialogTitle>
          <DialogDescription>
            {isOwner 
              ? "View appointments for this date. This is a read-only view."
              : "Click on any hour to book an appointment. Multiple appointments can be made for the same hour. Hours with existing appointments are shown in blue."}
          </DialogDescription>
        </DialogHeader>

        {hours.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No availability hours configured for this day.
          </div>
        ) : (
          <div className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hours.map((hour) => {
                  const hourAppointments = getAppointmentsForHour(hour);
                  const hasAppointments = hourAppointments.length > 0;

                  return (
                    <div
                      key={hour}
                      className={`h-auto p-4 flex flex-col items-start justify-start border rounded-md ${
                        hasAppointments
                          ? "bg-blue-50 border-blue-200"
                          : "bg-green-50 border-green-200"
                      } ${isOwner ? "cursor-default" : "cursor-pointer"}`}
                      onClick={() => !isOwner && handleHourClick(hour)}
                    >
                      <div className="font-semibold text-sm mb-2 w-full text-left">
                        {dayjs(`2000-01-01 ${hour}`).format("h:mm A")}
                      </div>
                      {hasAppointments && (
                        <div className="mt-2 space-y-1 w-full">
                          <div className="text-xs font-medium text-muted-foreground">
                            Appointments ({hourAppointments.length}):
                          </div>
                          {hourAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className="text-xs p-2 bg-white rounded border"
                            >
                              <div className="font-medium">{apt.title}</div>
                              {apt.appointmentType && (
                                <div className="text-muted-foreground">
                                  {apt.appointmentType.name}
                                </div>
                              )}
                              <div className="text-muted-foreground">
                                {apt.user.name || apt.user.email}
                              </div>
                            </div>
                          ))}
                          {!isOwner && (
                            <div className="text-xs text-blue-700 mt-2 font-medium">
                              Click to add more
                            </div>
                          )}
                        </div>
                      )}
                      {!hasAppointments && !isOwner && (
                        <div className="text-xs text-green-700 mt-2">
                          Click to book
                        </div>
                      )}
                      {!hasAppointments && isOwner && (
                        <div className="text-xs text-muted-foreground mt-2">
                          No appointments
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>

      {/* Create Appointment Dialog */}
      {organizationId && date && selectedHour && (
        <CreateAppointmentDialog
          organizationId={organizationId}
          date={date}
          hour={selectedHour}
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) {
              setSelectedHour(null);
            }
          }}
          onSuccess={handleAppointmentCreated}
        />
      )}
    </Dialog>
  );
}

