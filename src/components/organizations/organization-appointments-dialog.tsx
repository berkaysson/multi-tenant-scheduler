"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Calendar,
  Clock,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  CheckCheck,
  Info,
} from "lucide-react";

import { getOrganizationAppointments } from "@/actions/organization/get-organization-appointments";
import { updateAppointmentStatus } from "@/actions/appointment/update-appointment-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentStatus } from "@prisma/client";

interface AppointmentType {
  id: string;
  name: string;
  color: string | null;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  startTime: Date | string;
  endTime: Date | string;
  status: AppointmentStatus;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  cancellationReason: string | null;
  appointmentType: AppointmentType | null;
  user: User;
}

interface OrganizationAppointmentsDialogProps {
  organizationId: string;
  organizationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationAppointmentsDialog({
  organizationId,
  organizationName,
  open,
  onOpenChange,
}: OrganizationAppointmentsDialogProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [closestAppointment, setClosestAppointment] =
    useState<Appointment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (open && organizationId) {
      fetchAppointments();
    } else {
      // Reset filters when dialog closes
      setSelectedDate("");
      setSelectedHour("");
      setAppointments([]);
      setClosestAppointment(null);
    }
  }, [open, organizationId, selectedDate, selectedHour]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const result = await getOrganizationAppointments(
        organizationId,
        selectedDate || undefined,
        selectedHour || undefined
      );

      if (result.success) {
        setAppointments(result.appointments || []);
        if (result.closestAppointment) {
          setClosestAppointment(result.closestAppointment);
        }
      } else {
        toast.error(result.message || "Failed to load appointments");
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Something went wrong!");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const generateHourOptions = (): string[] => {
    const hours: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = String(hour).padStart(2, "0");
      hours.push(`${hourStr}:00`);
    }
    return hours;
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (date: Date | string) => {
    return dayjs(date).format("DD MMMM YYYY, HH:mm");
  };

  const formatTime = (date: Date | string) => {
    return dayjs(date).format("HH:mm");
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancellationReason("");
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setUpdatingStatus(selectedAppointment.id);
    try {
      const result = await updateAppointmentStatus(
        selectedAppointment.id,
        AppointmentStatus.CANCELLED,
        cancellationReason
      );

      if (result.success) {
        toast.success(result.message);
        setCancelDialogOpen(false);
        setSelectedAppointment(null);
        setCancellationReason("");
        fetchAppointments();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Something went wrong!");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleConfirmClick = async (appointment: Appointment) => {
    if (appointment.status === AppointmentStatus.CONFIRMED) {
      toast.error("Appointment is already confirmed!");
      return;
    }

    setUpdatingStatus(appointment.id);
    try {
      const result = await updateAppointmentStatus(
        appointment.id,
        AppointmentStatus.CONFIRMED
      );

      if (result.success) {
        toast.success(result.message);
        fetchAppointments();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Something went wrong!");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCompleteClick = async (appointment: Appointment) => {
    if (appointment.status === AppointmentStatus.COMPLETED) {
      toast.error("Appointment is already completed!");
      return;
    }

    setUpdatingStatus(appointment.id);
    try {
      const result = await updateAppointmentStatus(
        appointment.id,
        AppointmentStatus.COMPLETED
      );

      if (result.success) {
        toast.success(result.message);
        fetchAppointments();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Something went wrong!");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    // Reset hour when date changes
    setSelectedHour("");
  };

  const handleClearFilters = () => {
    setSelectedDate("");
    setSelectedHour("");
  };

  const displayAppointments = appointments;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md sm:max-w-3xl lg:max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Appointments - {organizationName}</DialogTitle>
            <DialogDescription>
              View and manage all appointments for your organization. Filter by
              date and hour.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label
                  htmlFor="date-filter"
                  className="text-sm font-medium mb-2 block"
                >
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Filter by Date
                </label>
                <Input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full"
                />
              </div>
              <div className="flex-1 w-full">
                <label
                  htmlFor="hour-filter"
                  className="text-sm font-medium mb-2 block"
                >
                  <Clock className="inline h-4 w-4 mr-2" />
                  Filter by Hour
                </label>
                <Select
                  value={selectedHour}
                  onValueChange={setSelectedHour}
                  disabled={!selectedDate}
                >
                  <SelectTrigger id="hour-filter" className="w-full">
                    <SelectValue
                      placeholder={
                        selectedDate ? "Select hour" : "Select date first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {generateHourOptions().map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {dayjs(`2000-01-01 ${hour}`).format("h:mm A")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(selectedDate || selectedHour) && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {!selectedDate && !selectedHour && closestAppointment && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <strong>Closest upcoming appointment:</strong>{" "}
                  {formatDateTime(closestAppointment.startTime)} -{" "}
                  {closestAppointment.title}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex-1 overflow-y-auto -mx-6 px-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground h-full flex flex-col items-center justify-center">
                <Calendar className="h-12 w-12 mb-4 text-gray-400" />
                <p className="font-semibold">
                  {selectedDate || selectedHour
                    ? "No appointments found"
                    : "No upcoming appointments"}
                </p>
                <p className="text-sm">
                  {selectedDate || selectedHour
                    ? "Try adjusting your filters."
                    : "There are no appointments scheduled."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayAppointments.map((appointment) => {
                  const isClosest =
                    !selectedDate &&
                    !selectedHour &&
                    closestAppointment?.id === appointment.id;
                  return (
                    <Card
                      key={appointment.id}
                      className={isClosest ? "border-blue-400 border-2" : ""}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-semibold">
                                {appointment.title}
                              </h3>
                              {isClosest && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Closest
                                </span>
                              )}
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                            </div>

                            {appointment.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {appointment.description}
                              </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div className="col-span-1 sm:col-span-2">
                                <span className="font-medium">
                                  Date & Time:
                                </span>{" "}
                                {formatDateTime(appointment.startTime)} -{" "}
                                {formatTime(appointment.endTime)}
                              </div>

                              {appointment.appointmentType && (
                                <div>
                                  <span className="font-medium">Type:</span>{" "}
                                  {appointment.appointmentType.name}
                                </div>
                              )}

                              <div>
                                <span className="font-medium">Client:</span>{" "}
                                {appointment.user.name ||
                                  appointment.user.email}
                              </div>

                              {appointment.contactName && (
                                <div>
                                  <span className="font-medium">
                                    Contact Name:
                                  </span>{" "}
                                  {appointment.contactName}
                                </div>
                              )}

                              {appointment.contactEmail && (
                                <div>
                                  <span className="font-medium">Email:</span>{" "}
                                  {appointment.contactEmail}
                                </div>
                              )}

                              {appointment.contactPhone && (
                                <div>
                                  <span className="font-medium">Phone:</span>{" "}
                                  {appointment.contactPhone}
                                </div>
                              )}

                              {appointment.notes && (
                                <div className="sm:col-span-2">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {appointment.notes}
                                </div>
                              )}

                              {appointment.cancellationReason && (
                                <div className="sm:col-span-2">
                                  <span className="font-medium text-red-600">
                                    Cancellation Reason:
                                  </span>{" "}
                                  <span className="text-red-600">
                                    {appointment.cancellationReason}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto md:ml-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-4">
                            {appointment.status !==
                              AppointmentStatus.CANCELLED &&
                              appointment.status !==
                                AppointmentStatus.COMPLETED && (
                                <>
                                  {appointment.status ===
                                    AppointmentStatus.PENDING && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleConfirmClick(appointment)
                                      }
                                      disabled={
                                        updatingStatus === appointment.id
                                      }
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full justify-start"
                                    >
                                      {updatingStatus === appointment.id ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <CheckCheck className="h-4 w-4 mr-2" />
                                      )}
                                      Confirm
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleCancelClick(appointment)
                                    }
                                    disabled={updatingStatus === appointment.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full justify-start"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleCompleteClick(appointment)
                                    }
                                    disabled={updatingStatus === appointment.id}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 w-full justify-start"
                                  >
                                    {updatingStatus === appointment.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                    )}
                                    Complete
                                  </Button>
                                </>
                              )}
                            {appointment.status ===
                              AppointmentStatus.CANCELLED && (
                              <span className="text-sm text-muted-foreground">
                                Cancelled
                              </span>
                            )}
                            {appointment.status ===
                              AppointmentStatus.COMPLETED && (
                              <span className="text-sm text-muted-foreground">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? Please provide a
              reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedAppointment && (
              <div>
                <p className="text-sm font-medium mb-2">Appointment:</p>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.title}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(selectedAppointment.startTime)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="cancellation-reason"
                className="text-sm font-medium"
              >
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="cancellation-reason"
                placeholder="Please provide a reason for cancellation"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancellationReason("");
                setSelectedAppointment(null);
              }}
              disabled={updatingStatus !== null}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={updatingStatus !== null || !cancellationReason.trim()}
            >
              {updatingStatus && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Cancel Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
