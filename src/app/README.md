# Application Routes & Structure

This documentation provides an overview of the application's routing structure within the `src/app` directory. The application uses Next.js App Router.

## 📂 Directory Structure Overview

The `src/app` directory is organized into several key sections:

- **Public Routes**: Accessible to all users.
- **Authentication (`/auth`)**: Routes handling user authentication flows.
- **Protected Routes (`/(protected)`)**: Routes that require the user to be logged in.
- **Organization Routes (`/o`)**: Public-facing organization pages.
- **API (`/api`)**: Backend API endpoints.

---

## 🌐 Public Routes

### `/` (Landing Page)

- **File**: `src/app/page.tsx`
- **Description**: The main entry point of the application. It currently serves as a landing page with a "Sign In" button that redirects to the login page.

### `/o/[slug]`

- **File**: `src/app/o/[slug]/page.tsx`
- **Description**: A dynamic route for public organization profiles.
- **Parameters**: `slug` - The unique identifier for the organization.
- **Content**: Displays public information about a specific organization.

---

## 🔐 Authentication Routes (`/auth`)

These routes handle the user authentication process.

### `/auth/login`

- **Description**: The login page where users can sign in to their accounts.

### `/auth/register`

- **Description**: The registration page for new users to create an account.

### `/auth/reset`

- **Description**: A page for users to request a password reset if they have forgotten their password.

### `/auth/new-password`

- **Description**: The page where users enter their new password after a reset request.

### `/auth/new-verification`

- **Description**: Handles email verification tokens sent to users during registration.

---

## 🛡️ Protected Routes (`/(protected)`)

These routes are wrapped in a layout that likely enforces authentication. Users must be logged in to access these pages.

### `/dashboard`

- **File**: `src/app/(protected)/dashboard/page.tsx`
- **Description**: The main user dashboard.
- **Features**:
  - Displays user session information (Name, Email, Role).
  - Provides a "Sign Out" button.
  - Debug view to show raw session data.

### `/appointments`

- **Description**: Management interface for user appointments.

### `/organizations`

- **Description**: General organization management for users.
- **Sub-routes**:
  - `/organizations`: List of organizations.
  - `/organizations/create`: Form to create a new organization.

### `/manager`

- **Description**: Dashboard and tools for Organization Managers.
- **Sub-routes**:
  - `/manager`: Manager dashboard.
  - `/manager/organization`: Settings and details for the managed organization.

### `/admin`

- **Description**: Administrative area for system admins.

### `/settings`

- **Description**: User account settings and preferences.

---

## ⚙️ API Routes (`/api`)

Backend endpoints for handling data and services.

### `/api/auth/[...nextauth]`

- **Description**: Handles NextAuth.js authentication requests (login, logout, session, callbacks).
