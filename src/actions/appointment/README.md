# Appointment Actions

This directory contains server actions related to appointment management. These actions handle creating, updating, retrieving, and cancelling appointments and appointment types.

## Files and Functions

### 1. `cancel-appointment.ts`

- **Function:** `cancelAppointment(appointmentId: string, cancellationReason?: string)`
- **Purpose:** Cancels an appointment for the current user.
- **Permissions:** Only the owner of the appointment (the user who created it) can cancel it using this action.
- **Key Logic:**
  - Verifies user session.
  - Checks if the appointment exists.
  - Ensures the current user is the owner of the appointment.
  - Prevents cancellation if the appointment is already cancelled or completed.
  - Updates the appointment status to `CANCELLED`.
  - Sends a notification (`APPOINTMENT_CANCELLED`) to the organization.

### 2. `create-appointment-type.ts`

- **Function:** `createAppointmentType(data: z.infer<typeof CreateAppointmentTypeSchema>)`
- **Purpose:** Creates a new appointment type for an organization.
- **Permissions:** Restricted to **Managers** and **Admins**.
- **Key Logic:**
  - Verifies user session and role.
  - Validates input data using `CreateAppointmentTypeSchema`.
  - Checks if the user has permission for the target organization.
  - Creates a new `AppointmentType` record in the database.

### 3. `create-appointment.ts`

- **Function:** `createAppointment(data: z.infer<typeof CreateAppointmentSchema>)`
- **Purpose:** Creates a new appointment request.
- **Permissions:** Authenticated users.
- **Key Logic:**
  - Verifies user session.
  - Validates input data using `CreateAppointmentSchema`.
  - Validates start and end times (format and logical order).
  - Checks if the organization and appointment type exist.
  - Creates a new `Appointment` record with status `PENDING`.
  - Sends a notification (`APPOINTMENT_CREATED`) to the organization.

### 4. `delete-appointment-type.ts`

- **Function:** `deleteAppointmentType(id: string)`
- **Purpose:** Deletes an existing appointment type.
- **Permissions:** Restricted to **Managers** and **Admins**.
- **Key Logic:**
  - Verifies user session and role.
  - Checks if the appointment type exists.
  - Ensures the user is the owner of the organization or an Admin.
  - Deletes the `AppointmentType` record.

### 5. `get-appointment-types.ts`

- **Function:** `getAppointmentTypes(organizationId: string)`
- **Purpose:** Retrieves all appointment types for a specific organization.
- **Permissions:** Public (authenticated users), but visibility depends on role.
- **Key Logic:**
  - Managers and Admins can see all appointment types.
  - Regular users can only see **active** appointment types.
  - Returns a list of appointment types ordered by creation date.

### 6. `get-appointments-by-date.ts`

- **Function:** `getAppointmentsByDate(organizationId: string, date: string)`
- **Purpose:** Fetches appointments for a specific organization on a specific date.
- **Permissions:** Authenticated users.
- **Key Logic:**
  - Parses the date to define the start and end of the day.
  - **Admins** and **Organization Owners** can see _all_ appointments for that day.
  - **Regular Users** can only see _their own_ appointments for that day.
  - Returns a list of appointments including appointment type and user details.

### 7. `get-user-appointments.ts`

This file contains two functions:

- **Function:** `getUserAppointments()`

  - **Purpose:** Retrieves all appointments for the current logged-in user.
  - **Key Logic:** Fetches appointments where `userId` matches the session user, ordered by start time. Includes organization and appointment type details.

- **Function:** `getNearestAppointment()`
  - **Purpose:** Retrieves the nearest upcoming appointment for the current user.
  - **Key Logic:** Fetches the first appointment where `startTime` is in the future and status is not `CANCELLED`.

### 8. `update-appointment-status.ts`

- **Function:** `updateAppointmentStatus(appointmentId: string, status: AppointmentStatus, cancellationReason?: string)`
- **Purpose:** Updates the status of an appointment (e.g., CONFIRM, CANCEL, COMPLETE).
- **Permissions:**
  - **Organization Owners/Admins:** Can update to any status.
  - **Users:** Can only update status to `CANCELLED` for their own appointments.
- **Key Logic:**
  - Verifies permissions based on the target status and user role.
  - Validates cancellation reason if status is `CANCELLED`.
  - Prevents modification of `COMPLETED` appointments.
  - Updates the appointment status.
  - Sends notifications to the user if the update was performed by the organization (e.g., `APPOINTMENT_CONFIRMED`, `APPOINTMENT_CANCELLED`).

### 9. `update-appointment-type.ts`

- **Function:** `updateAppointmentType(data: z.infer<typeof UpdateAppointmentTypeSchema>)`
- **Purpose:** Updates an existing appointment type.
- **Permissions:** Restricted to **Managers** and **Admins**.
- **Key Logic:**
  - Verifies user session and role.
  - Validates input data using `UpdateAppointmentTypeSchema`.
  - Checks if the appointment type exists and if the user has permission (Owner/Admin).
  - Updates the `AppointmentType` record.
