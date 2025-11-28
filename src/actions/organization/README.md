# Organization Actions

This directory contains server actions related to organization management. These actions handle creating, updating, retrieving, and deleting organizations, as well as managing their availability and appointments.

## Files and Functions

### `check-organization-ownership.ts`

- **`checkOrganizationOwnership(organizationId: string)`**: Checks if the current authenticated user is the owner (creator) of the specified organization. Returns an object indicating success and ownership status.

### `create-organization.ts`

- **`createOrganization(data: z.infer<typeof CreateOrganizationSchema>)`**: Creates a new organization with the provided data. It validates the input, checks for slug uniqueness, and if it's the user's first organization, promotes them to a MANAGER role.

### `create-unavailable-date.ts`

- **`createUnavailableDate(data: z.infer<typeof CreateUnavailableDateSchema>)`**: Adds a specific date as unavailable for an organization. Useful for holidays or ad-hoc closures.

### `create-weekly-availability.ts`

- **`createWeeklyAvailability(data: z.infer<typeof CreateWeeklyAvailabilitySchema>)`**: Sets up the weekly availability schedule for an organization. This action typically replaces existing availabilities with the new set provided.

### `delete-unavailable-date.ts`

- **`deleteUnavailableDate(data: z.infer<typeof DeleteUnavailableDateSchema>)`**: Removes a specific unavailable date entry, making that date available again for appointments.

### `delete-weekly-availability.ts`

- **`deleteWeeklyAvailability(data: z.infer<typeof DeleteWeeklyAvailabilitySchema>)`**: Deletes a specific weekly availability slot.

### `get-manager-organization.ts`

- **`getManagerOrganization()`**: Retrieves a list of organizations created by the current authenticated user (Manager). Includes details like members, appointment types, and availability schedules.

### `get-organization-appointments.ts`

- **`getOrganizationAppointments(organizationId: string, date?: string, hour?: string)`**: Fetches appointments for a given organization. Supports filtering by date and hour. Restricted to organization owners and admins.

### `get-organization.ts`

- **`getOrganizationBySlug(slug: string)`**: Retrieves public details of an organization using its unique slug. Used for public-facing pages.
- **`getOrganization(organizationId: string)`**: Retrieves full details of an organization by its ID.
- **`getAllOrganizations()`**: Fetches all organizations in the system.
- **`getPublicOrganizations()`**: Fetches a list of all active and public organizations.
- **`getOrganizations(searchQuery?: string, sortBy?: string, sortOrder?: 'asc' | 'desc')`**: Retrieves organizations with support for search (by name, city, country) and sorting.

### `update-organization.ts`

- **`updateOrganization(data: z.infer<typeof UpdateOrganizationSchema>)`**: Updates the details of an existing organization. Requires the user to be the owner or an admin. Handles slug updates and uniqueness checks.

### `update-weekly-availability.ts`

- **`updateWeeklyAvailability(data: z.infer<typeof UpdateWeeklyAvailabilitySchema>)`**: Updates the details of a specific weekly availability slot (e.g., changing hours for a specific day).
