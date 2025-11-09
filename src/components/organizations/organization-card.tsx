"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Mail, Phone, Building2 } from "lucide-react";
import { Organization } from "./types";

interface OrganizationCardProps {
  org: Organization;
  onShowMap: (org: Organization) => void;
  onShowCalendar: (org: Organization) => void;
}

export function OrganizationCard({ org, onShowMap, onShowCalendar }: OrganizationCardProps) {
  return (
    <Card className={`flex flex-col h-full transition-shadow duration-300 hover:shadow-xl ${!org.isActive ? 'bg-gray-50/50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{org.name}</CardTitle>
            {org.city && org.country && (
              <CardDescription className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4" />
                {org.city}, {org.country}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge variant={org.isActive ? "default" : "secondary"} className={org.isActive ? "bg-green-600 hover:bg-green-700" : ""}>
              {org.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={org.isPublic ? "outline" : "secondary"}>
              {org.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        {org.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {org.description}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {org.latitude && org.longitude && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onShowMap(org)}
              className="w-full gap-2"
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
              className="w-full gap-2"
            >
              <Calendar className="h-4 w-4" />
              View Calendar
            </Button>
          )}
        </div>

        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          {org.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{org.email}</span>
            </div>
          )}
          {org.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{org.phone}</span>
            </div>
          )}
          {org.address && (
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{org.address}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-auto">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="font-bold text-foreground">{org._count.members}</p>
              <p className="text-muted-foreground text-xs">Members</p>
            </div>
            <div>
              <p className="font-bold text-foreground">{org._count.appointments}</p>
              <p className="text-muted-foreground text-xs">Appointments</p>
            </div>
            <div>
              <p className="font-bold text-foreground">{org._count.appointmentTypes}</p>
              <p className="text-muted-foreground text-xs">Types</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <p>Created: {new Date(org.createdAt).toLocaleDateString()}</p>
          <p className="truncate">By: {org.createdBy.name || org.createdBy.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
