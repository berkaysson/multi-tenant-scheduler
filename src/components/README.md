# Components Documentation

This directory contains the React components for the application, organized by feature.

## Appointments Components

**Directory:** `src/components/appointments`

This directory contains components related to appointment management.

### `CancelAppointmentDialog`

**File:** `cancel-appointment-dialog.tsx`

A dialog component that allows users to cancel an existing appointment.

- **Props:**
  - `appointmentId`: The ID of the appointment to cancel.
  - `appointmentTitle`: The title of the appointment for display.
  - `open`: Boolean to control dialog visibility.
  - `onOpenChange`: Callback to change open state.
  - `onSuccess`: Optional callback triggered after successful cancellation.
- **Features:**
  - Captures a cancellation reason.
  - Calls `cancelAppointment` action.
  - Displays success/error toasts.

## Auth Components

**Directory:** `src/components/auth`

This directory contains components related to user authentication and authorization.

### `LoginForm`

**File:** `login-form.tsx`
A form component for user login.

- Uses `react-hook-form` and `zod` for validation.
- Handles email/password login.
- Includes a link to the "Forgot Password" page.
- Wraps content in `CardWrapper`.

### `RegisterForm`

**File:** `register-form.tsx`
A form component for user registration.

- Collects user details (name, email, password).
- Uses `register` action to create a new account.

### `CardWrapper`

**File:** `card-wrapper.tsx`
A wrapper component used by auth forms to provide a consistent look and feel.

- **Props:**
  - `headerLabel`: Text to display in the header.
  - `backButtonLabel`: Label for the back button.
  - `backButtonHref`: URL for the back button.
  - `showSocial`: Boolean to show social login buttons.

### `Socials`

**File:** `socials.tsx`
Component displaying social login buttons (e.g., Google, GitHub) using `next-auth`.

### `NewPasswordForm`

**File:** `new-password-form.tsx`
Form for setting a new password after a reset request.

### `ResetForm`

**File:** `reset-form.tsx`
Form to request a password reset email.

### `NewVerificationForm`

**File:** `new-verification-form.tsx`
Component to handle email verification token processing.

### `LoginButton`

**File:** `login-button.tsx`
A button component that triggers the login modal or redirects to the login page.

## Navigation Components

**Directory:** `src/components/navigation`

This directory contains components for the application's navigation structure.

### `ProtectedNavigation`

**File:** `ProtectedNavigation.tsx`
The main navigation bar for authenticated users.

- **Features:**
  - Responsive design (desktop and mobile views).
  - Displays application logo and links.
  - Includes `NotificationBell` and `UserNav`.
  - Adapts links based on user role (e.g., showing "My Organization" for managers).

### `NotificationBell`

**File:** `NotificationBell.tsx`
A notification center component.

- **Features:**
  - Displays a bell icon with an unread count badge.
  - Shows a dropdown list of notifications.
  - Supports real-time updates using Supabase subscriptions.
  - Allows marking notifications as read or deleting them.
  - Fetches notifications using `getNotifications` action.

### `UserNav`

**File:** `UserNav.tsx`
User profile navigation component.

- Typically displays the user's avatar.
- Provides a dropdown menu for profile settings, logout, etc.

## Organization Components

**Directory:** `src/components/organizations`

This directory contains components for managing and viewing organizations.

### `OrganizationCard`

**File:** `organization-card.tsx`
A card component displaying a summary of an organization.

- **Features:**
  - Shows name, location, status (Active/Inactive), and visibility (Public/Private).
  - Displays contact info (email, phone).
  - Shows statistics (members, appointments, types).
  - Provides actions to show map, calendar, or public page.

### `CreateOrganizationForm`

**File:** `create-organization-form.tsx`
A comprehensive form to create a new organization.

- **Features:**
  - Collects basic info (name, slug, description).
  - Collects contact and location info (address, coordinates via `LocationPicker`).
  - Handles form submission using `createOrganization` action.

### `UpdateOrganizationForm`

**File:** `update-organization-form.tsx`
Similar to `CreateOrganizationForm`, but for updating existing organization details.

### `OrganizationAppointmentsDialog`

**File:** `organization-appointments-dialog.tsx`
A dialog for managers to view and manage appointments.

- **Features:**
  - Lists appointments with filtering by date and hour.
  - Highlights the closest upcoming appointment.
  - Allows confirming, completing, or canceling appointments.
  - Displays detailed appointment information.

### `CreateAppointmentDialog`

**File:** `create-appointment-dialog.tsx`
A dialog to create a new appointment for a specific date and time.

- **Features:**
  - Allows selecting an appointment type (which determines duration).
  - Collects title, description, and optional contact info.
  - Calculates end time based on duration.
  - Uses `createAppointment` action.

### `OrganizationCalendarDialog`

**File:** `organization-calendar-dialog.tsx`
A dialog displaying the organization's schedule in a calendar view.

### `WeeklyAvailabilityForm`

**File:** `weekly-availability-form.tsx`
Form to configure the organization's weekly operating hours.

### `UnavailableDatesForm`

**File:** `unavailable-dates-form.tsx`
Form to manage specific dates when the organization is unavailable (e.g., holidays).

### `AppointmentTypesForm`

**File:** `appointment-types-form.tsx`
Form to manage the types of appointments the organization offers (e.g., "Consultation", "Check-up").

### `OrganizationSearchFilter`

**File:** `organization-search-filter.tsx`
Component for filtering the list of organizations (e.g., by search term).

### `OrganizationShareDialog`

**File:** `organization-share-dialog.tsx`
Dialog to share the organization's public link.

### `OrganizationMapDialogs`

**File:** `organization-map-dialogs.tsx`
Dialogs related to displaying the organization on a map.

### `OrganizationHoursDialog`

**File:** `organization-hours-dialog.tsx`
Dialog to view or edit organization hours (likely wraps `WeeklyAvailabilityForm`).
