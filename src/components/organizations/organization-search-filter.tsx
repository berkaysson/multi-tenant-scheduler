"use client";

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
import { MapPin, Loader2 } from "lucide-react";

interface OrganizationSearchFilterProps {
  searchQuery: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  loading: boolean;
  onSearchQueryChange: (query: string) => void;
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (order: "asc" | "desc") => void;
  onSearch: (e: React.FormEvent) => void;
  onReset: () => void;
  onShowAllMap: () => void;
}

export function OrganizationSearchFilter({
  searchQuery,
  sortBy,
  sortOrder,
  loading,
  onSearchQueryChange,
  onSortByChange,
  onSortOrderChange,
  onSearch,
  onReset,
  onShowAllMap,
}: OrganizationSearchFilterProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Search & Filter Organizations</CardTitle>
        <CardDescription>
          Find organizations by name, city, country, or description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="lg:col-span-2"
              disabled={loading}
            />
            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Sort by
              </label>
              <Select value={sortBy} onValueChange={onSortByChange} disabled={loading}>
                <SelectTrigger id="sortBy" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="nearest">Nearest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700">
                Order
              </label>
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => onSortOrderChange(value)} disabled={loading}>
                <SelectTrigger id="sortOrder" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={loading} className="flex-grow sm:flex-grow-0">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              disabled={loading}
              className="flex-grow sm:flex-grow-0"
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onShowAllMap}
              className="gap-2 flex-grow sm:flex-grow-0 sm:ml-auto"
            >
              <MapPin className="h-4 w-4" />
              View All on Map
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}