"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";
import { Organization } from "./types";

interface OrganizationCardProps {
  org: Organization;
  onShowMap: (org: Organization) => void;
  onShowCalendar: (org: Organization) => void;
}

export function OrganizationCard({ org, onShowMap, onShowCalendar }: OrganizationCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
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
        
        <div className="mb-4 flex gap-2">
          {org.latitude && org.longitude && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onShowMap(org)}
              className={org.isActive ? "flex-1 gap-2" : "w-full gap-2"}
            >
              <MapPin className="h-4 w-4" />
              Show in Map
            </Button>
          )}
          {org.isActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onShowCalendar(org)}
              className={`gap-2 ${org.latitude && org.longitude ? "flex-1" : "w-full"}`}
            >
              <Calendar className="h-4 w-4" />
              View Calendar
            </Button>
          )}
        </div>
        
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
  );
}

