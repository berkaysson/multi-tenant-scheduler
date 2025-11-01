"use client";

import { useEffect, useState } from "react";
import { getManagerOrganization } from "@/actions/get-manager-organization";
import { UpdateOrganizationForm } from "@/components/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManagerOrganizationPage() {
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganization = async () => {
      setLoading(true);
      const result = await getManagerOrganization();
      
      if (result.success && result.organization) {
        setOrganization(result.organization);
        setError(null);
      } else {
        setError(result.message || "Failed to load organization");
      }
      setLoading(false);
    };

    fetchOrganization();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your organization...</p>
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
            <CardTitle>My Organization</CardTitle>
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

  if (!organization) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Organization</h1>
        <p className="text-muted-foreground">
          View and update your organization details
        </p>
      </div>

      {/* Organization Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Organization Overview</CardTitle>
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
      <UpdateOrganizationForm organization={organization} />
    </div>
  );
}

