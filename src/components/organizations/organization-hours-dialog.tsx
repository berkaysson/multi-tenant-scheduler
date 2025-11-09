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
import { Loader2, CalendarX2 } from "lucide-react";
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

  const getDayOfWeekIndex = (dayOfWeek: string): number => {
    const dayMap: { [key: string]: number } = {
      SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
    };
    return dayMap[dayOfWeek] ?? -1;
  };

  const generateHoursForDate = (dateStr: string): string[] => {
    const dateObj = dayjs(dateStr);
    const dayIndex = dateObj.day();
    const availability = weeklyAvailability.find(
      (avail) => getDayOfWeekIndex(avail.dayOfWeek) === dayIndex
    );

    if (!availability) return [];

    const hours: string[] = [];
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    const start = dayjs().hour(startHour).minute(startMinute);
    const end = dayjs().hour(endHour).minute(endMinute);

    let current = start;
    while (current.isBefore(end)) {
      hours.push(current.format("HH:mm"));
      current = current.add(1, "hour");
    }

    return hours;
  };

  const getAppointmentsForHour = (hour: string): Appointment[] => {
    if (!date) return [];
    const [hourNum, minuteNum] = hour.split(':').map(Number);
    const hourStart = dayjs(date).hour(hourNum).minute(minuteNum);
    const hourEnd = hourStart.add(1, "hour");

    return appointments.filter((apt) => {
      const aptStart = dayjs(apt.startTime);
      return (aptStart.isAfter(hourStart) || aptStart.isSame(hourStart)) && aptStart.isBefore(hourEnd);
    });
  };

  const handleHourClick = (hour: string) => {
    if (isOwner || !organizationId || !date) return;
    setSelectedHour(hour);
    setShowCreateDialog(true);
  };

  const handleAppointmentCreated = () => {
    fetchAppointments();
  };

  if (!date) return null;

  const hours = generateHoursForDate(date);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isOwner ? "Appointments" : "Available Hours"} for {dayjs(date).format("MMMM D, YYYY")}
            </DialogTitle>
            <DialogDescription>
              {isOwner
                ? "View all appointments for this date. This is a read-only view."
                : "Click on an available time slot to book an appointment."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>Loading schedule...</p>
              </div>
            ) : hours.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <CalendarX2 className="h-12 w-12 mb-4" />
                <p className="font-semibold">No Availability</p>
                <p className="text-sm">No hours are configured for this day.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hours.map((hour) => {
                  const hourAppointments = getAppointmentsForHour(hour);
                  const hasAppointments = hourAppointments.length > 0;

                  return (
                    <div
                      key={hour}
                      onClick={() => handleHourClick(hour)}
                      onKeyDown={(e) => !isOwner && (e.key === 'Enter' || e.key === ' ') && handleHourClick(hour)}
                      tabIndex={isOwner ? -1 : 0}
                      className={`
                        p-3 flex flex-col items-start justify-between rounded-lg border transition-all duration-200
                        ${isOwner
                          ? 'cursor-default'
                          : 'cursor-pointer hover:bg-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                        }
                        ${hasAppointments
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/30'
                          : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/30'
                        }
                      `}
                    >
                      <div className="font-bold text-base text-foreground mb-2">
                        {dayjs(`2000-01-01 ${hour}`).format("h:mm A")}
                      </div>

                      <div className="w-full mt-auto">
                        {isOwner ? (
                          hasAppointments ? (
                            <div className="space-y-1.5">
                              {hourAppointments.map(apt => (
                                <div key={apt.id} className="text-xs p-1.5 bg-background/70 rounded border">
                                  <div className="font-semibold text-foreground truncate">{apt.title}</div>
                                  {apt.appointmentType && <div className="text-muted-foreground text-[11px] truncate">{apt.appointmentType.name}</div>}
                                  <div className="text-muted-foreground text-[11px] mt-0.5 truncate">{apt.user.name || apt.user.email}</div>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-sm text-muted-foreground">No appointments</p>
                        ) : (
                          <div className="text-sm">
                            {hasAppointments ? (
                              <>
                                <p className="font-semibold text-blue-800 dark:text-blue-300">{hourAppointments.length} Appointment(s)</p>
                                <p className="text-xs text-muted-foreground mt-1">Click to book another</p>
                              </>
                            ) : (
                              <>
                                <p className="font-semibold text-green-800 dark:text-green-300">Available</p>
                                <p className="text-xs text-muted-foreground mt-1">Click to book</p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {organizationId && date && selectedHour && (
        <CreateAppointmentDialog
          organizationId={organizationId}
          date={date}
          hour={selectedHour}
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) setSelectedHour(null);
          }}
          onSuccess={handleAppointmentCreated}
        />
      )}
    </>
  );
}