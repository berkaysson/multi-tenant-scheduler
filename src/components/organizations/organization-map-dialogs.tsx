"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LocationViewer, ViewerLocation } from "@/components/ui/location-viewer";
import { Organization } from "./types";

interface OrganizationMapDialogsProps {
  showAllMap: boolean;
  selectedOrg: Organization | null;
  organizations: Organization[];
  onAllMapChange: (open: boolean) => void;
  onSelectedOrgChange: (org: Organization | null) => void;
}

function getAllLocations(organizations: Organization[]): ViewerLocation[] {
  return organizations
    .filter((org) => org.latitude && org.longitude)
    .map((org) => ({
      position: [org.latitude!, org.longitude!],
      title: org.name,
      description: `${org.address || ""} ${org.city ? org.city : ""} ${org.country ? org.country : ""}`.trim() || undefined,
      tooltip: org.name,
    }));
}

function getOrgLocations(org: Organization): ViewerLocation[] {
  if (!org.latitude || !org.longitude) return [];
  return [
    {
      position: [org.latitude, org.longitude],
      title: org.name,
      description: `${org.address || ""} ${org.city ? org.city : ""} ${org.country ? org.country : ""}`.trim() || undefined,
      tooltip: org.name,
    },
  ];
}

export function OrganizationMapDialogs({
  showAllMap,
  selectedOrg,
  organizations,
  onAllMapChange,
  onSelectedOrgChange,
}: OrganizationMapDialogsProps) {
  return (
    <>
      {/* All Locations Map Dialog */}
      <Dialog open={showAllMap} onOpenChange={onAllMapChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>All Organizations on Map</DialogTitle>
            <DialogDescription>
              View all organizations that have location data on the map
            </DialogDescription>
          </DialogHeader>
          <LocationViewer
            locations={getAllLocations(organizations)}
            height="500px"
            fitBounds={true}
          />
        </DialogContent>
      </Dialog>

      {/* Single Organization Map Dialog */}
      <Dialog open={selectedOrg !== null} onOpenChange={(open) => !open && onSelectedOrgChange(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedOrg?.name} on Map</DialogTitle>
            <DialogDescription>
              {selectedOrg?.address && `${selectedOrg.address}, `}
              {selectedOrg?.city && `${selectedOrg.city}, `}
              {selectedOrg?.country}
            </DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <LocationViewer
              center={
                selectedOrg.latitude && selectedOrg.longitude
                  ? [selectedOrg.latitude, selectedOrg.longitude]
                  : undefined
              }
              zoom={14}
              locations={getOrgLocations(selectedOrg)}
              height="500px"
              fitBounds={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

