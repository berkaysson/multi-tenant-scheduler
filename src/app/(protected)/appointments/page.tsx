"use client";

import { getUserAppointments, getNearestAppointment } from "@/actions/get-user-appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dayjs from "@/lib/dayjs";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Building2, Phone, Mail, X } from "lucide-react";
import { CancelAppointmentDialog } from "@/components/appointments/cancel-appointment-dialog";

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
    
    // Fetch both all appointments and nearest appointment
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

  const getStatusColor = (status: string) => {
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

  const formatTime = (date: Date) => {
    return dayjs(date).format("DD MMMM YYYY, HH:mm");
  };

  const isUpcoming = (date: Date) => {
    return dayjs(date).isAfter(dayjs());
  };

  const getRelativeTime = (date: Date) => {
    return dayjs(date).fromNow();
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelSuccess = () => {
    fetchAppointments();
  };

  const canCancelAppointment = (appointment: Appointment) => {
    return appointment.status !== "CANCELLED" && 
           appointment.status !== "COMPLETED" &&
           isUpcoming(appointment.startTime);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter((apt) => 
    isUpcoming(apt.startTime) && apt.status !== "CANCELLED"
  );
  const pastAppointments = appointments.filter((apt) => 
    !isUpcoming(apt.startTime) || apt.status === "CANCELLED"
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600">
            View and manage all your appointments
          </p>
        </div>

        {/* Nearest Appointment Card */}
        {nearestAppointment && (
          <Card className="mb-8 border-2 border-indigo-500 shadow-lg">
            <CardHeader className="bg-indigo-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Next Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {nearestAppointment.title}
                  </h3>
                  {nearestAppointment.description && (
                    <p className="text-gray-600 mb-4">
                      {nearestAppointment.description}
                    </p>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {formatTime(nearestAppointment.startTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getRelativeTime(nearestAppointment.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-gray-500" />
                      <p className="text-gray-800">{nearestAppointment.organization.name}</p>
                    </div>
                    {nearestAppointment.organization.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <p className="text-gray-600">
                          {nearestAppointment.organization.address}
                          {nearestAppointment.organization.city && 
                            `, ${nearestAppointment.organization.city}`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(nearestAppointment.status)}`}>
                      {nearestAppointment.status}
                    </span>
                  </div>
                  {nearestAppointment.appointmentType && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Appointment Type</p>
                      <p className="font-semibold text-gray-800">
                        {nearestAppointment.appointmentType.name}
                      </p>
                      {nearestAppointment.appointmentType.duration && (
                        <p className="text-sm text-gray-600">
                          Duration: {nearestAppointment.appointmentType.duration} minutes
                        </p>
                      )}
                    </div>
                  )}
                  {nearestAppointment.contactPhone && (
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{nearestAppointment.contactPhone}</p>
                    </div>
                  )}
                  {nearestAppointment.contactEmail && (
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">{nearestAppointment.contactEmail}</p>
                    </div>
                  )}
                  {nearestAppointment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="text-sm text-gray-800">{nearestAppointment.notes}</p>
                    </div>
                  )}
                  {canCancelAppointment(nearestAppointment) && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelClick(nearestAppointment)}
                        className="w-full"
                      >
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

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Upcoming Appointments ({upcomingAppointments.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{appointment.title}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{appointment.organization.name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {formatTime(appointment.startTime)}
                        </span>
                      </div>
                      {appointment.appointmentType && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Type:</span>
                          <span>{appointment.appointmentType.name}</span>
                        </div>
                      )}
                      {appointment.organization.address && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span>
                            {appointment.organization.address}
                          </span>
                        </div>
                      )}
                    </div>
                    {canCancelAppointment(appointment) && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(appointment)}
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel Appointment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Past Appointments ({pastAppointments.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="opacity-75 hover:opacity-100 hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{appointment.title}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{appointment.organization.name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">
                          {formatTime(appointment.startTime)}
                        </span>
                      </div>
                      {appointment.appointmentType && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Type:</span>
                          <span>{appointment.appointmentType.name}</span>
                        </div>
                      )}
                      {appointment.status === "CANCELLED" && appointment.cancellationReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          <p className="font-medium mb-1">Cancellation Reason:</p>
                          <p>{appointment.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Appointment Dialog */}
        {selectedAppointment && (
          <CancelAppointmentDialog
            appointmentId={selectedAppointment.id}
            appointmentTitle={selectedAppointment.title}
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            onSuccess={handleCancelSuccess}
          />
        )}

        {/* No Appointments */}
        {appointments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No appointments found</p>
              <p className="text-gray-500">You don't have any appointments yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;

