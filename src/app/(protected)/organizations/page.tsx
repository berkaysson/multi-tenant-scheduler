"use client";

import { getOrganizations } from "@/actions/get-organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
  _count: {
    members: number;
    appointments: number;
    appointmentTypes: number;
  };
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { data: session } = useSession();

  const fetchOrganizations = async () => {
    setLoading(true);
    const result = await getOrganizations(searchQuery, sortBy, sortOrder);
    if (result.success && result.organizations) {
      setOrganizations(result.organizations);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizations();
  }, [sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrganizations();
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Organizations
          </h1>
          <p className="text-gray-600">
            Browse and search through all available organizations
          </p>
        </div>

        {/* Search and Sort Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Search organizations by name, city, country, or description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
              <Input
                type="text"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSortBy("createdAt");
                  setSortOrder("desc");
                  fetchOrganizations();
                }}
              >
                Reset
              </Button>
            </form>

            <div className="mt-4 flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
                  Sort by:
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sortBy" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="appointments">Appointments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700">
                  Order:
                </label>
                <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                  <SelectTrigger id="sortOrder" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizations List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading organizations...</p>
          </div>
        ) : organizations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No organizations found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{org.name}</CardTitle>
                      {org.city && org.country && (
                        <CardDescription>
                          📍 {org.city}, {org.country}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {org.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                      {org.isPublic ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Public
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {org.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {org.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {org.email && (
                      <p className="text-xs text-gray-600">
                        ✉️ {org.email}
                      </p>
                    )}
                    {org.phone && (
                      <p className="text-xs text-gray-600">
                        📞 {org.phone}
                      </p>
                    )}
                    {org.address && (
                      <p className="text-xs text-gray-600">
                        📮 {org.address}
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="font-semibold text-gray-800">{org._count.members}</p>
                        <p className="text-gray-600">Members</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{org._count.appointments}</p>
                        <p className="text-gray-600">Appointments</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{org._count.appointmentTypes}</p>
                        <p className="text-gray-600">Types</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Created: {new Date(org.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    By: {org.createdBy.name || org.createdBy.email}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

