"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { updateOrganization } from "@/actions/organization/update-organization";
import { UpdateOrganizationSchema } from "@/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationPicker } from "@/components/ui/location-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

type FormData = z.infer<typeof UpdateOrganizationSchema>;

interface UpdateOrganizationFormProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    logo: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string;
    isActive: boolean;
    isPublic: boolean;
  };
  onUpdate?: () => void;
}

export function UpdateOrganizationForm({
  organization,
  onUpdate,
}: UpdateOrganizationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(UpdateOrganizationSchema),
    defaultValues: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description || "",
      email: organization.email || "",
      phone: organization.phone || "",
      website: organization.website || "",
      logo: organization.logo || "",
      address: organization.address || "",
      city: organization.city || "",
      country: organization.country || "",
      latitude: organization.latitude || undefined,
      longitude: organization.longitude || undefined,
      timezone: organization.timezone,
      isActive: organization.isActive,
      isPublic: organization.isPublic,
    },
  });

  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  useEffect(() => {
    form.reset({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description || "",
      email: organization.email || "",
      phone: organization.phone || "",
      website: organization.website || "",
      logo: organization.logo || "",
      address: organization.address || "",
      city: organization.city || "",
      country: organization.country || "",
      latitude: organization.latitude || undefined,
      longitude: organization.longitude || undefined,
      timezone: organization.timezone,
      isActive: organization.isActive,
      isPublic: organization.isPublic,
    });
  }, [organization, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await updateOrganization(data);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        if (onUpdate) {
          onUpdate();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter organization name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug*</FormLabel>
                      <FormControl>
                        <Input placeholder="organization-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Enter organization description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact & Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@organization.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1234567890"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://organization.com"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://organization.com/logo.png"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main St"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New York"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="USA"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Map Location</FormLabel>
                <LocationPicker
                  center={
                    latitude && longitude
                      ? [latitude, longitude]
                      : [41.0082, 28.9784]
                  }
                  zoom={13}
                  height="400px"
                  initialLocation={
                    latitude && longitude ? [latitude, longitude] : undefined
                  }
                  onLocationSelect={(location) => {
                    form.setValue("latitude", location[0], {
                      shouldValidate: true,
                    });
                    form.setValue("longitude", location[1], {
                      shouldValidate: true,
                    });
                  }}
                />
                <FormDescription>
                  Click on the map to select the organization location.
                </FormDescription>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="0.000000"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="0.000000"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Settings</h3>
              <div className="flex items-center gap-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(
                            checked: boolean | "indeterminate"
                          ) => field.onChange(!!checked)}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(
                            checked: boolean | "indeterminate"
                          ) => field.onChange(!!checked)}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Public</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Organization
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
