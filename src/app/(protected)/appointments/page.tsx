"use client";

import { getUserAppointments, getNearestAppointment } from "@/actions/get-user-appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dayjs from "@/lib/dayjs";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Building2, Phone, Mail, X } from "lucide-react";
import { CancelAppointmentDialog } from "@/components/appointments/cancel-appointment-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Data types from your original code
interface AppointmentType {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  color: string | null;
}
interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
}
interface Appointment {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  status: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  cancellationReason: string | null;
  organization: Organization;
  appointmentType: AppointmentType | null;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentsPageSkeleton = () => (
  <div className="space-y-8">
    <div>
      <Skeleton className="h-10 w-1/3 mb-2" />
      <Skeleton className="h-5 w-1/2" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-1/2" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
            <div className="pt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <div>
      <Skeleton className="h-8 w-1/3 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [nearestAppointment, setNearestAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const [allAppointments, nearest] = await Promise.all([
      getUserAppointments(),
      getNearestAppointment(),
    ]);
    if (allAppointments.success && allAppointments.appointments) {
      setAppointments(allAppointments.appointments);
    }
    if (nearest.success && nearest.appointment) {
      setNearestAppointment(nearest.appointment);
    }
    setLoading(false);
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "CONFIRMED": return "default";
      case "CANCELLED": return "destructive";
      case "PENDING": return "secondary";
      case "COMPLETED": return "outline";
      case "NO_SHOW": return "secondary";
      default: return "outline";
    }
  };

  const formatTime = (date: Date) => dayjs(date).format("ddd, DD MMM YYYY [at] HH:mm");
  const isUpcoming = (date: Date) => dayjs(date).isAfter(dayjs());
  const getRelativeTime = (date: Date) => dayjs(date).fromNow();

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelSuccess = () => fetchAppointments();

  const canCancelAppointment = (appointment: Appointment) => {
    return appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && isUpcoming(appointment.startTime);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <AppointmentsPageSkeleton />
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter((apt) => isUpcoming(apt.startTime) && apt.status !== "CANCELLED");
  const pastAppointments = appointments.filter((apt) => !isUpcoming(apt.startTime) || apt.status === "CANCELLED");

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
            My Appointments
          </h1>
          <p className="text-muted-foreground">
            View and manage all your upcoming and past appointments.
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No appointments found</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You don&apos;t have any scheduled appointments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {nearestAppointment && (
              <Card className="border-2 border-primary shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Calendar className="w-5 h-5" />
                    Next Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        {nearestAppointment.title}
                      </h3>
                      {nearestAppointment.description && (
                        <p className="text-muted-foreground">{nearestAppointment.description}</p>
                      )}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">{formatTime(nearestAppointment.startTime)}</p>
                            <p className="text-sm text-muted-foreground">{getRelativeTime(nearestAppointment.startTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          <p className="text-foreground">{nearestAppointment.organization.name}</p>
                        </div>
                        {nearestAppointment.organization.address && (
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">
                              {nearestAppointment.organization.address}
                              {nearestAppointment.organization.city && `, ${nearestAppointment.organization.city}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4 md:hidden" />

                    <div className="space-y-4">
                      <Badge variant={getStatusVariant(nearestAppointment.status)} className="capitalize">{nearestAppointment.status.toLowerCase()}</Badge>
                      {nearestAppointment.appointmentType && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Appointment Type</p>
                          <p className="font-semibold text-foreground">{nearestAppointment.appointmentType.name} ({nearestAppointment.appointmentType.duration} min)</p>
                        </div>
                      )}
                      <div className="space-y-2 text-sm">
                        {nearestAppointment.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground">{nearestAppointment.contactPhone}</p>
                          </div>
                        )}
                        {nearestAppointment.contactEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground">{nearestAppointment.contactEmail}</p>
                          </div>
                        )}
                      </div>
                      {nearestAppointment.notes && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Notes from you</p>
                          <p className="text-sm text-muted-foreground italic">&quot;{nearestAppointment.notes}&quot;</p>
                        </div>
                      )}
                      {canCancelAppointment(nearestAppointment) && (
                        <div className="pt-4">
                          <Button variant="destructive" size="sm" onClick={() => handleCancelClick(nearestAppointment)} className="w-full">
                            <X className="w-4 h-4 mr-2" />
                            Cancel Appointment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {upcomingAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming ({upcomingAppointments.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <CardTitle className="text-lg">{appointment.title}</CardTitle>
                          <Badge variant={getStatusVariant(appointment.status)} className="capitalize">{appointment.status.toLowerCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.organization.name}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{formatTime(appointment.startTime)}</span>
                        </div>
                        {appointment.organization.address && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground">{appointment.organization.address}</span>
                          </div>
                        )}
                        {canCancelAppointment(appointment) && (
                          <div className="pt-3 mt-3 border-t">
                            <Button variant="destructive" size="sm" onClick={() => handleCancelClick(appointment)} className="w-full">
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Past & Cancelled ({pastAppointments.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id} className="bg-card/60 hover:bg-card transition-colors">
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <CardTitle className="text-lg">{appointment.title}</CardTitle>
                          <Badge variant={getStatusVariant(appointment.status)} className="capitalize">{appointment.status.toLowerCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.organization.name}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{formatTime(appointment.startTime)}</span>
                        </div>
                        {appointment.status === "CANCELLED" && appointment.cancellationReason && (
                          <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                            <p className="font-medium mb-1">Reason:</p>
                            <p>{appointment.cancellationReason}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedAppointment && (
          <CancelAppointmentDialog
            appointmentId={selectedAppointment.id}
            appointmentTitle={`${selectedAppointment.title} with ${selectedAppointment.organization.name}`}
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onSuccess={handleCancelSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;