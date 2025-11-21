"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  Clock,
  User,
  LogIn,
} from "lucide-react";
import { OrganizationCalendarDialog } from "@/components/organizations/organization-calendar-dialog";
import { OrganizationHoursDialog } from "@/components/organizations/organization-hours-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  isPublic: boolean;
  weeklyAvailability: WeeklyAvailability[];
  unavailableDates: UnavailableDate[];
  appointmentTypes: AppointmentType[];
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
  _count: {
    appointments: number;
    appointmentTypes: number;
  };
}

interface PublicOrganizationPageClientProps {
  organization: Organization;
  isAuthenticated: boolean;
}

export function PublicOrganizationPageClient({
  organization,
  isAuthenticated,
}: PublicOrganizationPageClientProps) {
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleCalendarClick = () => {
    if (!isAuthenticated) {
      // Show alert or redirect to login
      return;
    }
    setShowCalendarDialog(true);
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const getDayName = (dayOfWeek: string) => {
    const dayMap: { [key: string]: string } = {
      MONDAY: "Monday",
      TUESDAY: "Tuesday",
      WEDNESDAY: "Wednesday",
      THURSDAY: "Thursday",
      FRIDAY: "Friday",
      SATURDAY: "Saturday",
      SUNDAY: "Sunday",
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{organization.name}</h1>
            {organization.city && organization.country && (
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {organization.city}, {organization.country}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={organization.isActive ? "default" : "secondary"} className={organization.isActive ? "bg-green-600 hover:bg-green-700" : ""}>
              {organization.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">Public</Badge>
          </div>
        </div>

        {organization.description && (
          <p className="text-muted-foreground text-lg leading-relaxed">{organization.description}</p>
        )}
      </div>

      {/* Authentication Alert */}
      {!isAuthenticated && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <LogIn className="h-4 w-4" />
          <AlertDescription>
            You need to{" "}
            <Link href="/auth/login" className="font-semibold underline">
              log in
            </Link>{" "}
            to create an appointment.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Book an Appointment
              </CardTitle>
              <CardDescription>
                Select a date and time to book your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <Button onClick={handleCalendarClick} className="w-full" size="lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Calendar & Book Appointment
                </Button>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handleCalendarClick}
                    className="w-full"
                    size="lg"
                    variant="outline"
                    disabled
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    View Calendar (Login Required)
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Please{" "}
                    <Link href="/auth/login" className="font-semibold underline">
                      log in
                    </Link>{" "}
                    to view the calendar and book appointments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Availability */}
          {organization.weeklyAvailability.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Weekly Availability
                </CardTitle>
                <CardDescription>Our regular operating hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {organization.weeklyAvailability.map((avail) => (
                    <div
                      key={avail.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <span className="font-medium">{getDayName(avail.dayOfWeek)}</span>
                      <span className="text-muted-foreground">
                        {avail.startTime} - {avail.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointment Types */}
          {organization.appointmentTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Appointment Types</CardTitle>
                <CardDescription>Choose from our appointment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organization.appointmentTypes.map((type) => (
                    <div
                      key={type.id}
                      className="p-4 border rounded-lg"
                      style={{
                        borderLeftColor: type.color || undefined,
                        borderLeftWidth: type.color ? "4px" : undefined,
                      }}
                    >
                      <h3 className="font-semibold mb-1">{type.name}</h3>
                      {type.description && (
                        <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Duration: {type.duration} minutes
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {organization.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={`mailto:${organization.email}`}
                    className="text-sm hover:underline break-all"
                  >
                    {organization.email}
                  </a>
                </div>
              )}
              {organization.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${organization.phone}`} className="text-sm hover:underline">
                    {organization.phone}
                  </a>
                </div>
              )}
              {organization.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline break-all"
                  >
                    {organization.website}
                  </a>
                </div>
              )}
              {organization.address && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{organization.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Appointments</span>
                  <span className="font-bold">{organization._count.appointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Appointment Types</span>
                  <span className="font-bold">{organization._count.appointmentTypes}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Organization Owner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {organization.createdBy.name || organization.createdBy.email}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calendar Dialog */}
      <OrganizationCalendarDialog
        organizationId={organization.id}
        organizationName={organization.name}
        isAuthenticated={isAuthenticated}
        open={showCalendarDialog}
        onOpenChange={setShowCalendarDialog}
      />

      {/* Hours Dialog */}
      {selectedDate && (
        <OrganizationHoursDialog
          date={selectedDate}
          weeklyAvailability={organization.weeklyAvailability}
          organizationId={organization.id}
          isOwner={false}
          isAuthenticated={isAuthenticated}
          open={showHoursDialog}
          onOpenChange={(open) => {
            setShowHoursDialog(open);
            if (!open) setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}
