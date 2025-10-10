# Next.js Authentication Starter

## Description

This project is a Next.js 14 starter app designed to provide a robust and scalable foundation for building web applications with user authentication. Leveraging PostgreSQL, Prisma, and NextAuth, it offers integration and best practices for secure and efficient user management.

## Tech Stack

- **[Next.js 14](https://nextjs.org/)**: The latest version of the popular React framework for building server-side rendered applications.
- **[PostgreSQL](https://www.postgresql.org/)**: A powerful, open source object-relational database system.
- **[Prisma](https://www.prisma.io/)**: A next-generation ORM for Node.js and TypeScript.
- **[NextAuth.js](https://next-auth.js.org/)**: Authentication for Next.js applications.
- **[Resend](https://www.npmjs.com/package/resend)**: Email sending service.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
- **[ShadCN](https://shadcn.dev/)**: A collection of components built with Tailwind CSS and Radix UI.

## Features

- **Login Form**: Includes email and password fields with options for social logins using Google and GitHub.
- **Register Form**: Allows users to sign up with email, password, and name.
- **Client-Server Integration**: Communication between the client-side and server-side components.
- **Database Integration**: Utilizes PostgreSQL and Prisma for database management.
- **Middleware Routes**: Implements protected routes, authentication routes, and a profile page for user settings.
- **Token Generation**: Generates tokens for email verification and password reset, and sends them via Resend.io.
- **Verification and Password Reset**: Handles user email verification and password reset processes.
- **Form Validation**: Uses Zod for clear form validation.
- **Encryption**: Employs bcryptjs for password encryption.
- **Decent UI**: Features a user interface built with Tailwind CSS and ShadCN.


## How to Use

### Installation

1. **Clone the repository**:

   ```sh
   git clone <this repo>
   cd nextjs-auth-starter
   ```

2. **Install dependencies**:

   ```sh
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following variables:

   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `RESEND_API_KEY`

4. **Edit Prisma models as you want and Run Prisma migrations**:

   ```sh
   npx prisma migrate dev
   ```

5. **Start the development server**:
   ```sh
   npm run dev
   ```

## Contributing

Feel free to fork.