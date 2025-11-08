"use client";

import { useEffect, useState } from "react";
import { getManagerOrganization } from "@/actions/get-manager-organization";
import { UpdateOrganizationForm, AppointmentTypesForm, WeeklyAvailabilityForm, UnavailableDatesForm, OrganizationCalendarDialog, OrganizationAppointmentsDialog } from "@/components/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Calendar, CalendarClock } from "lucide-react";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  slug: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  logo?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string;
  description?: string | null;
  isActive: boolean;
  isPublic: boolean;
  appointmentTypes?: any[];
  weeklyAvailability?: any[];
  unavailableDates?: any[];
  _count?: {
    appointments: number;
    appointmentTypes: number;
  };
}

export default function ManagerOrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [calendarStates, setCalendarStates] = useState<Record<string, boolean>>({});
  const [appointmentsStates, setAppointmentsStates] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const fetchOrganizations = async () => {
    setLoading(true);
    const result = await getManagerOrganization();
    
    if (result.success && result.organizations) {
      setOrganizations(result.organizations);
      if (result.organizations.length > 0 && !activeTab) {
        setActiveTab(result.organizations[0].id);
      }
      setError(null);
    } else {
      setError(result.message || "Failed to load organizations");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleShowCalendar = (organizationId: string) => {
    setCalendarStates(prev => ({ ...prev, [organizationId]: true }));
  };

  const handleCloseCalendar = (organizationId: string) => {
    setCalendarStates(prev => ({ ...prev, [organizationId]: false }));
  };

  const handleShowAppointments = (organizationId: string) => {
    setAppointmentsStates(prev => ({ ...prev, [organizationId]: true }));
  };

  const handleCloseAppointments = (organizationId: string) => {
    setAppointmentsStates(prev => ({ ...prev, [organizationId]: false }));
  };

  const renderOrganizationContent = (organization: Organization) => {
    return (
      <div>
        {/* Organization Overview Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Organization Overview</CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleShowAppointments(organization.id)}
                  className="gap-2"
                >
                  <CalendarClock className="h-4 w-4" />
                  View Appointments
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleShowCalendar(organization.id)}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  View Calendar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{organization.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <p className="text-lg font-semibold">{organization.slug}</p>
              </div>
              {organization.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{organization.email}</p>
                </div>
              )}
              {organization.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg">{organization.phone}</p>
                </div>
              )}
              {organization.city && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">City</p>
                  <p className="text-lg">{organization.city}</p>
                </div>
              )}
              {organization.country && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Country</p>
                  <p className="text-lg">{organization.country}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-1 rounded text-sm ${organization.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {organization.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${organization.isPublic ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {organization.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statistics</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-sm">
                    {organization._count?.appointments || 0} Appointments
                  </span>
                  <span className="text-sm">
                    {organization._count?.appointmentTypes || 0} Types
                  </span>
                </div>
              </div>
            </div>
            {organization.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-muted-foreground">{organization.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Form */}
        <UpdateOrganizationForm 
          organization={{
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            description: organization.description ?? null,
            email: organization.email ?? null,
            phone: organization.phone ?? null,
            website: organization.website ?? null,
            logo: organization.logo ?? null,
            address: organization.address ?? null,
            city: organization.city ?? null,
            country: organization.country ?? null,
            latitude: organization.latitude ?? null,
            longitude: organization.longitude ?? null,
            timezone: organization.timezone ?? "Europe/Istanbul",
            isActive: organization.isActive,
            isPublic: organization.isPublic,
          }}
          onUpdate={fetchOrganizations} 
        />

        {/* Weekly Availability Form */}
        <div className="mt-6">
          <WeeklyAvailabilityForm
            organizationId={organization.id}
            weeklyAvailability={organization.weeklyAvailability || []}
            onUpdate={fetchOrganizations}
          />
        </div>

        {/* Appointment Types Form */}
        <div className="mt-6">
          <AppointmentTypesForm
            organizationId={organization.id}
            appointmentTypes={organization.appointmentTypes || []}
            onUpdate={fetchOrganizations}
          />
        </div>

        {/* Unavailable Dates Form */}
        <div className="mt-6">
          <UnavailableDatesForm
            organizationId={organization.id}
            unavailableDates={organization.unavailableDates || []}
            onUpdate={fetchOrganizations}
          />
        </div>

        {/* Calendar Dialog */}
        <OrganizationCalendarDialog
          organizationId={organization.id}
          organizationName={organization.name}
          open={calendarStates[organization.id] || false}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseCalendar(organization.id);
            } else {
              handleShowCalendar(organization.id);
            }
          }}
        />

        {/* Appointments Dialog */}
        <OrganizationAppointmentsDialog
          organizationId={organization.id}
          organizationName={organization.name}
          open={appointmentsStates[organization.id] || false}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseAppointments(organization.id);
            } else {
              handleShowAppointments(organization.id);
            }
          }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your organizations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push("/organizations/create")}>
                Create Organization
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Organizations</h1>
        <p className="text-muted-foreground">
          View and update your organization details
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full max-w-4xl mb-6 overflow-x-auto">
          {organizations.map((org) => (
            <TabsTrigger key={org.id} value={org.id} className="whitespace-nowrap min-w-[120px]">
              {org.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {organizations.map((org) => (
          <TabsContent key={org.id} value={org.id}>
            {renderOrganizationContent(org)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

