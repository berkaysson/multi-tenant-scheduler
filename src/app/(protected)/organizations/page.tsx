"use client";

import { useEffect, useState } from "react";
import { getOrganizations } from "@/actions/get-organization";
import { Card, CardContent } from "@/components/ui/card";
import {
  OrganizationCard,
  OrganizationSearchFilter,
  OrganizationMapDialogs,
  OrganizationCalendarDialog,
} from "@/components/organizations";
import { Organization } from "@/components/organizations/types";
import { Loader2 } from "lucide-react";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAllMap, setShowAllMap] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [calendarOrg, setCalendarOrg] = useState<Organization | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchOrganizations = async (query = searchQuery, sort = sortBy, order = sortOrder) => {
    setLoading(true);
    const result = await getOrganizations(query, sort, order);
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

  const handleShowAllMap = () => setShowAllMap(true);
  const handleShowOrgMap = (org: Organization) => setSelectedOrg(org);
  const handleShowCalendar = (org: Organization) => {
    setCalendarOrg(org);
    setShowCalendar(true);
  };

  const handleReset = () => {
    const newQuery = "";
    const newSortBy = "createdAt";
    const newSortOrder = "desc";
    setSearchQuery(newQuery);
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    fetchOrganizations(newQuery, newSortBy, newSortOrder);
  };

  const activeOrgs = organizations.filter(org => org.isActive);
  const inactiveOrgs = organizations.filter(org => !org.isActive);

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Organizations
          </h1>
          <p className="text-gray-600">
            Browse and search through all available organizations.
          </p>
        </div>

        <OrganizationSearchFilter
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          loading={loading}
          onSearchQueryChange={setSearchQuery}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          onSearch={handleSearch}
          onReset={handleReset}
          onShowAllMap={handleShowAllMap}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : organizations.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg text-gray-600">No organizations found.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeOrgs.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Active Organizations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeOrgs.map((org) => (
                    <OrganizationCard
                      key={org.id}
                      org={org}
                      onShowMap={handleShowOrgMap}
                      onShowCalendar={handleShowCalendar}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactiveOrgs.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                  Inactive Organizations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inactiveOrgs.map((org) => (
                    <div key={org.id} className="opacity-75 hover:opacity-100 transition-opacity">
                      <OrganizationCard
                        org={org}
                        onShowMap={handleShowOrgMap}
                        onShowCalendar={handleShowCalendar}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <OrganizationMapDialogs
        showAllMap={showAllMap}
        selectedOrg={selectedOrg}
        organizations={organizations}
        onAllMapChange={setShowAllMap}
        onSelectedOrgChange={setSelectedOrg}
      />

      <OrganizationCalendarDialog
        organizationId={calendarOrg?.id || null}
        organizationName={calendarOrg?.name || ""}
        open={showCalendar}
        onOpenChange={setShowCalendar}
      />
    </div>
  );
}