"use client";

import { useEffect, useState } from "react";
import { getManagerOrganization } from "@/actions/get-manager-organization";
import { UpdateOrganizationForm, AppointmentTypesForm, WeeklyAvailabilityForm, UnavailableDatesForm, OrganizationCalendarDialog, OrganizationAppointmentsDialog } from "@/components/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Calendar, CalendarClock, Building, Settings, Clock, List } from "lucide-react";
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
        const activeOrg = result.organizations.find(org => org.isActive);
        setActiveTab(activeOrg ? activeOrg.id : result.organizations[0].id);
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
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>{organization.name}</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleShowAppointments(organization.id)}
                  className="gap-2 flex-1"
                >
                  <CalendarClock className="h-4 w-4" />
                  Appointments
                </Button>
                {organization.isActive && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleShowCalendar(organization.id)}
                    className="gap-2 flex-1"
                  >
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details"><Settings className="h-4 w-4 mr-2" />Details</TabsTrigger>
            <TabsTrigger value="availability"><Clock className="h-4 w-4 mr-2" />Availability</TabsTrigger>
            <TabsTrigger value="services"><List className="h-4 w-4 mr-2" />Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
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
          </TabsContent>
          
          <TabsContent value="availability" className="space-y-6">
            <WeeklyAvailabilityForm
              organizationId={organization.id}
              weeklyAvailability={organization.weeklyAvailability || []}
              onUpdate={fetchOrganizations}
            />
            <UnavailableDatesForm
              organizationId={organization.id}
              unavailableDates={organization.unavailableDates || []}
              onUpdate={fetchOrganizations}
            />
          </TabsContent>

          <TabsContent value="services">
            <AppointmentTypesForm
              organizationId={organization.id}
              appointmentTypes={organization.appointmentTypes || []}
              onUpdate={fetchOrganizations}
            />
          </TabsContent>
        </Tabs>

        <OrganizationCalendarDialog
          organizationId={organization.id}
          organizationName={organization.name}
          open={calendarStates[organization.id] || false}
          onOpenChange={(open) => open ? handleShowCalendar(organization.id) : handleCloseCalendar(organization.id)}
        />

        <OrganizationAppointmentsDialog
          organizationId={organization.id}
          organizationName={organization.name}
          open={appointmentsStates[organization.id] || false}
          onOpenChange={(open) => open ? handleShowAppointments(organization.id) : handleCloseAppointments(organization.id)}
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
          <CardContent className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Could not load organizations</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/organizations/create")}>
              Create Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return null;
  }

  const activeOrganizations = organizations.filter(org => org.isActive);
  const inactiveOrganizations = organizations.filter(org => !org.isActive);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Organizations</h1>
        <p className="text-muted-foreground">
          View and update your organization details, availability, and services.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <TabsList>
            {activeOrganizations.map((org) => (
              <TabsTrigger key={org.id} value={org.id} className="whitespace-nowrap">
                {org.name}
              </TabsTrigger>
            ))}
            {inactiveOrganizations.length > 0 && activeOrganizations.length > 0 && (
              <div className="mx-2 h-6 w-px bg-border" />
            )}
            {inactiveOrganizations.map((org) => (
              <TabsTrigger 
                key={org.id} 
                value={org.id} 
                className="whitespace-nowrap opacity-60"
              >
                {org.name} (Inactive)
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <div className="mt-6">
          {organizations.map((org) => (
            <TabsContent key={org.id} value={org.id}>
              {renderOrganizationContent(org)}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}