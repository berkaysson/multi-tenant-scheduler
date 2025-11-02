"use client";

import { getOrganizations } from "@/actions/get-organization";
import { Card, CardContent } from "@/components/ui/card";
import {
  OrganizationCard,
  OrganizationSearchFilter,
  OrganizationMapDialogs,
  OrganizationCalendarDialog,
  Organization,
} from "@/components/organizations";
import { useEffect, useState } from "react";

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

  const handleShowAllMap = () => {
    setShowAllMap(true);
  };

  const handleShowOrgMap = (org: Organization) => {
    setSelectedOrg(org);
  };

  const handleShowCalendar = (org: Organization) => {
    setCalendarOrg(org);
    setShowCalendar(true);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("createdAt");
    setSortOrder("desc");
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
              <OrganizationCard
                key={org.id}
                org={org}
                onShowMap={handleShowOrgMap}
                onShowCalendar={handleShowCalendar}
              />
            ))}
          </div>
        )}
      </div>

      {/* Map Dialogs */}
      <OrganizationMapDialogs
        showAllMap={showAllMap}
        selectedOrg={selectedOrg}
        organizations={organizations}
        onAllMapChange={setShowAllMap}
        onSelectedOrgChange={setSelectedOrg}
      />

      {/* Calendar Dialog */}
      <OrganizationCalendarDialog
        organizationId={calendarOrg?.id || null}
        organizationName={calendarOrg?.name || ""}
        open={showCalendar}
        onOpenChange={setShowCalendar}
      />
    </div>
  );
}
