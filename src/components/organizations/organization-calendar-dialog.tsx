"use client";

import { useEffect, useState } from "react";
import { getOrganization } from "@/actions/get-organization";
import { checkOrganizationOwnership } from "@/actions/check-organization-ownership";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { OrganizationHoursDialog } from "./organization-hours-dialog";

interface WeeklyAvailability {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface UnavailableDate {
  id: string;
  date: Date | string;
  reason: string | null;
}

interface OrganizationCalendarDialogProps {
  organizationId: string | null;
  organizationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationCalendarDialog({
  organizationId,
  organizationName,
  open,
  onOpenChange,
}: OrganizationCalendarDialogProps) {
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (open && organizationId) {
      fetchOrganizationData();
      checkOwnership();
    }
  }, [open, organizationId]);

  const fetchOrganizationData = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const result = await getOrganization(organizationId);
      if (result.success && result.organization) {
        setWeeklyAvailability(result.organization.weeklyAvailability || []);
        setUnavailableDates(result.organization.unavailableDates || []);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    if (!organizationId) return;
    
    try {
      const result = await checkOrganizationOwnership(organizationId);
      if (result.success) {
        setIsOwner(result.isOwner);
      }
    } catch (error) {
      console.error("Error checking organization ownership:", error);
      setIsOwner(false);
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

  // Check if a date is in weekly availability
  const isDateInWeeklyAvailability = (date: dayjs.Dayjs): boolean => {
    const dayIndex = date.day(); // dayjs uses 0 = Sunday
    return weeklyAvailability.some(
      (avail) => getDayOfWeekIndex(avail.dayOfWeek) === dayIndex
    );
  };

  // Check if a date is unavailable
  const getUnavailableDate = (date: dayjs.Dayjs): UnavailableDate | null => {
    const dateStr = date.format("YYYY-MM-DD");
    return (
      unavailableDates.find((unavail) => {
        const unavailDate = dayjs(unavail.date).format("YYYY-MM-DD");
        return unavailDate === dateStr;
      }) || null
    );
  };

  // Get day status and reason
  const getDayStatus = (date: dayjs.Dayjs): { available: boolean; reason: string | null } => {
    const unavailableDate = getUnavailableDate(date);
    
    if (unavailableDate) {
      return { available: false, reason: unavailableDate.reason };
    }

    if (isDateInWeeklyAvailability(date)) {
      return { available: true, reason: null };
    }

    // If not in weekly availability and not unavailable, show as unavailable
    return { available: false, reason: "Not available on this day of the week" };
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const startOfCalendar = startOfMonth.startOf("week");
    const endOfCalendar = endOfMonth.endOf("week");

    const days: dayjs.Dayjs[] = [];
    let current = startOfCalendar;

    while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar)) {
      days.push(current);
      current = current.add(1, "day");
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const formatDateKey = (date: dayjs.Dayjs): string => {
    return date.format("YYYY-MM-DD");
  };

  // Handle day click
  const handleDayClick = (date: dayjs.Dayjs) => {
    const dateKey = formatDateKey(date);
    const status = getDayStatus(date);
    const isCurrentMonth = date.month() === currentMonth.month();

    // Allow clicks on available days in current month (both owners and non-owners can view)
    // Owners will see read-only view, non-owners can book
    if (isCurrentMonth && status.available && organizationId) {
      setSelectedDate(dateKey);
      setShowHoursDialog(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Availability Calendar - {organizationName}</DialogTitle>
            <DialogDescription>
              {isOwner 
                ? "View your organization's calendar and appointments. This is a read-only view."
                : "Green indicates available dates, red indicates unavailable dates. Click on green dates to see hourly availability. Hover over red dates to see reasons."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePreviousMonth}
                className="px-4 py-2 rounded-md border hover:bg-accent"
              >
                ← Previous
              </button>
              <h2 className="text-xl font-semibold">
                {currentMonth.format("MMMM YYYY")}
              </h2>
              <button
                onClick={handleNextMonth}
                className="px-4 py-2 rounded-md border hover:bg-accent"
              >
                Next →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm py-2 text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((date) => {
                const dateKey = formatDateKey(date);
                const status = getDayStatus(date);
                const isCurrentMonth = date.month() === currentMonth.month();
                const isToday = date.isSame(dayjs(), "day");

                return (
                  <div
                    key={dateKey}
                    className={`aspect-square p-2 border rounded-md flex flex-col items-center justify-center transition-colors ${
                      !isCurrentMonth
                        ? "opacity-30"
                        : status.available
                        ? "bg-green-100 hover:bg-green-200 border-green-300 cursor-pointer"
                        : "bg-red-100 hover:bg-red-200 border-red-300 cursor-default"
                    } ${isToday ? "ring-2 ring-primary" : ""}`}
                    onMouseEnter={() => setHoveredDate(dateKey)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => handleDayClick(date)}
                  >
                    <span
                      className={`text-sm font-medium ${
                        !isCurrentMonth
                          ? "text-muted-foreground"
                          : status.available
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {date.date()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-6 justify-center flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                <span className="text-sm">Unavailable</span>
              </div>
            </div>

            {/* Tooltip for unavailable dates */}
            {hoveredDate && (() => {
              const date = dayjs(hoveredDate);
              const status = getDayStatus(date);
              const isCurrentMonth = date.month() === currentMonth.month();
              
              if (isCurrentMonth && !status.available && status.reason) {
                return (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">
                      {date.format("MMMM D, YYYY")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {status.reason}
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Weekly Availability Info */}
            {weeklyAvailability.length > 0 && (
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="font-semibold mb-2">Weekly Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {weeklyAvailability.map((avail) => (
                    <div key={avail.id} className="text-sm">
                      <span className="font-medium">{avail.dayOfWeek}:</span>{" "}
                      <span>
                        {avail.startTime} - {avail.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </DialogContent>
      </Dialog>

      {/* Hours Dialog */}
      <OrganizationHoursDialog
        date={selectedDate}
        weeklyAvailability={weeklyAvailability}
        organizationId={organizationId}
        isOwner={isOwner}
        open={showHoursDialog}
        onOpenChange={setShowHoursDialog}
      />
    </>
  );
}

