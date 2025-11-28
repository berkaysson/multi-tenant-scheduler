"use client";

import { useEffect, useState } from "react";
import { getOrganization } from "@/actions/organization/get-organization";
import { checkOrganizationOwnership } from "@/actions/organization/check-organization-ownership";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
  isAuthenticated?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationCalendarDialog({
  organizationId,
  organizationName,
  isAuthenticated = true,
  open,
  onOpenChange,
}: OrganizationCalendarDialogProps) {
  const [weeklyAvailability, setWeeklyAvailability] = useState<
    WeeklyAvailability[]
  >([]);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>(
    []
  );
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

  const isDateInWeeklyAvailability = (date: dayjs.Dayjs): boolean => {
    const dayIndex = date.day();
    return weeklyAvailability.some(
      (avail) => getDayOfWeekIndex(avail.dayOfWeek) === dayIndex
    );
  };

  const getUnavailableDate = (date: dayjs.Dayjs): UnavailableDate | null => {
    const dateStr = date.format("YYYY-MM-DD");
    return (
      unavailableDates.find(
        (unavail) => dayjs(unavail.date).format("YYYY-MM-DD") === dateStr
      ) || null
    );
  };

  const getDayStatus = (
    date: dayjs.Dayjs
  ): { available: boolean; reason: string | null } => {
    const unavailableDate = getUnavailableDate(date);
    if (unavailableDate) {
      return { available: false, reason: unavailableDate.reason };
    }
    if (isDateInWeeklyAvailability(date)) {
      return { available: true, reason: null };
    }
    return {
      available: false,
      reason: "Not available on this day of the week",
    };
  };

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

  const handleDayClick = (date: dayjs.Dayjs) => {
    const status = getDayStatus(date);
    if (
      date.month() === currentMonth.month() &&
      status.available &&
      organizationId
    ) {
      setSelectedDate(date.format("YYYY-MM-DD"));
      setShowHoursDialog(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Availability Calendar - {organizationName}
            </DialogTitle>
            <DialogDescription>
              {isOwner
                ? "View your organization's calendar. This is a read-only view."
                : "Green dates are available. Click one to see available hours."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center flex-grow">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-y-auto pr-2">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentMonth(currentMonth.subtract(1, "month"))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold text-center">
                  {currentMonth.format("MMMM YYYY")}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-sm py-2 text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
                {calendarDays.map((date) => {
                  const dateKey = date.format("YYYY-MM-DD");
                  const status = getDayStatus(date);
                  const isCurrentMonth = date.month() === currentMonth.month();
                  const isToday = date.isSame(dayjs(), "day");
                  return (
                    <div
                      key={dateKey}
                      className={`relative aspect-square p-1 border rounded-md flex items-center justify-center transition-colors text-sm ${
                        !isCurrentMonth
                          ? "text-muted-foreground/30 bg-muted/20"
                          : status.available
                          ? "bg-green-100 hover:bg-green-200 border-green-300 cursor-pointer text-green-900"
                          : "bg-red-100 border-red-300 cursor-default text-red-900"
                      } ${isToday ? "ring-2 ring-primary" : ""}`}
                      onMouseEnter={() => setHoveredDate(dateKey)}
                      onMouseLeave={() => setHoveredDate(null)}
                      onClick={() => handleDayClick(date)}
                    >
                      {date.date()}
                    </div>
                  );
                })}
              </div>

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

              {hoveredDate &&
                (() => {
                  const date = dayjs(hoveredDate);
                  const status = getDayStatus(date);
                  if (
                    date.month() === currentMonth.month() &&
                    !status.available &&
                    status.reason
                  ) {
                    return (
                      <div className="mt-4 p-3 bg-muted rounded-md text-center">
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

              {weeklyAvailability.length > 0 && (
                <div className="mt-6 p-4 bg-muted rounded-md">
                  <h3 className="font-semibold mb-2">Weekly Availability</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {weeklyAvailability.map((avail) => (
                      <div
                        key={avail.id}
                        className="text-sm flex justify-between"
                      >
                        <span className="font-medium capitalize">
                          {avail.dayOfWeek.toLowerCase()}:
                        </span>
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

      <OrganizationHoursDialog
        date={selectedDate}
        weeklyAvailability={weeklyAvailability}
        organizationId={organizationId}
        isOwner={isOwner}
        isAuthenticated={isAuthenticated}
        open={showHoursDialog}
        onOpenChange={setShowHoursDialog}
      />
    </>
  );
}
