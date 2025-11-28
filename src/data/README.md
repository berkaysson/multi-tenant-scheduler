# Data Access Layer Documentation

This directory (`src/data`) contains the data access layer of the application. It includes functions for interacting with the database to retrieve, create, and manage data related to users, tokens, and notifications.

## Files and Functions

### `reset-password-token.ts`

Handles the retrieval of password reset tokens.

- **`getResetPasswordTokenByToken(token: string)`**

  - Retrieves a reset password token record by the token string.
  - Returns the token object or `null` if not found.

- **`getResetPasswordTokenByEmail(email: string)`**
  - Retrieves a reset password token record associated with a specific email.
  - Returns the token object or `null` if not found.

### `subscribe-notifications.ts`

Manages real-time subscriptions for user notifications.

- **`subscribeToNotifications(userId: string, onUpdate: () => void)`**
  - Subscribes to real-time updates for the `notifications` table in Supabase for a specific user.
  - Triggers the `onUpdate` callback whenever a change (INSERT, UPDATE, DELETE) occurs.
  - Returns a cleanup function to unsubscribe from the channel.

### `tokens.ts`

Handles the generation and management of authentication tokens.

- **`generateVerificationToken(email: string)`**

  - Generates a new email verification token.
  - Deletes any existing verification token for the email before creating a new one.
  - Sets an expiration time (default: 1 hour).
  - Returns the created verification token.

- **`generateResetPasswordToken(email: string)`**
  - Generates a new password reset token.
  - Deletes any existing reset token for the email before creating a new one.
  - Sets an expiration time (default: 1 hour).
  - Returns the created reset password token.

### `user.ts`

Provides functions to retrieve user information.

- **`getUserByEmail(email: string)`**

  - Retrieves a user record by their email address.
  - Returns the user object or `null` if not found.

- **`getUserById(id: string)`**
  - Retrieves a user record by their unique ID.
  - Returns the user object or `null` if not found.

### `verification-token.ts`

Handles the retrieval of email verification tokens.

- **`getVerificationTokenByEmail(email: string)`**

  - Retrieves a verification token record associated with a specific email.
  - Returns the token object or `null` if not found.

- **`getVerificationTokenByToken(token: string)`**
  - Retrieves a verification token record by the token string.
  - Returns the token object or `null` if not found.
