# Multi-Tenant Appointment Scheduler

A robust and scalable multi-tenant scheduling application built with **Next.js 14**. This platform allows users to create organizations, manage staff availability, define appointment types, and handle bookings efficiently. It features a secure authentication system, role-based access control, and a modern user interface.

## Features

- **🏢 Multi-Tenancy**: Create and manage multiple organizations, each with its own profile, settings, and members.
- **📅 Advanced Scheduling**:
  - Define custom **Appointment Types** (duration, description, color).
  - Set **Weekly Availability** schedules per organization.
  - Manage **Unavailable Dates** (holidays, closures).
- **👥 Role-Based Access Control (RBAC)**:
  - **Admin**: System-wide control.
  - **Manager**: Organization owner/admin capabilities.
  - **User**: Standard user for booking appointments.
- **🔐 Secure Authentication**:
  - Powered by **NextAuth.js v5**.
  - Supports **Google OAuth** and **Credentials** (Email/Password).
  - Includes **Email Verification** and **Password Reset** flows via **Resend**.
- **🔔 Notifications**: System for tracking appointment updates (Created, Cancelled, Confirmed).
- **🎨 Modern UI**: Responsive design built with **Tailwind CSS** and **ShadCN UI**.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://authjs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN](https://ui.shadcn.com/)
- **Email**: [Resend](https://resend.com/)

## Project Documentation

Detailed documentation for specific modules and actions can be found in the following README files:

- **[Data Access Layer](src/data/README.md)**: Documentation for the data access layer, including user, token, and notification management.
- **[Appointment Actions](src/actions/appointment/README.md)**: Server actions for creating, updating, and managing appointments.
- **[Auth Actions](src/actions/auth/README.md)**: Server actions for authentication processes like login, register, and password reset.
- **[Notification Actions](src/actions/notification/README.md)**: Server actions for handling user notifications.
- **[Organization Actions](src/actions/organization/README.md)**: Server actions for organization management, including availability and scheduling.

## Key Configuration Files

- **[Database Schema (Prisma)](src/prisma/schema.prisma)**: Defines the database models for Users, Organizations, Appointments, and more.
- **[Auth Configuration](src/auth.config.ts)**: Configures NextAuth providers (Google, Credentials) and authorization logic.
- **[Auth Initialization](src/auth.ts)**: Initializes NextAuth with Prisma adapter and session callbacks.
- **[Middleware](src/middleware.ts)**: Handles route protection, authentication checks, and role-based redirects.
- **[Route Definitions](src/routes.ts)**: Defines public, auth, and protected routes, along with role-based access control rules.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL Database (e.g., Supabase)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root directory and add the following variables:

    ```env
    # Database (Supabase Transaction & Session Connection Poolers)
    SUPABASE_DATABASE_URL="postgres://..."
    SUPABASE_DIRECT_URL="postgres://..."

    # NextAuth
    AUTH_SECRET="your-secret-key"

    # OAuth Providers
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"

    # Email Service
    RESEND_API_KEY="re_..."

    # App URL
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

4.  **Run Database Migrations**:

    ```bash
    npx prisma migrate dev
    ```

5.  **Start the development server**:
    ```bash
    npm run dev
    ```

The application should now be running at `http://localhost:3000`.
