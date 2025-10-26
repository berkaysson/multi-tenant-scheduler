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
import { MapPin } from "lucide-react";

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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Search & Filter</CardTitle>
        <CardDescription>
          Search organizations by name, city, country, or description
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={onShowAllMap}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            See in Map
          </Button>
        </div>
        <form onSubmit={onSearch} className="flex gap-4 flex-wrap">
          <Input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
          >
            Reset
          </Button>
        </form>

        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <Select value={sortBy} onValueChange={onSortByChange}>
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
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => onSortOrderChange(value)}>
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
  );
}

