# Auth Actions

This directory contains server actions related to user authentication and account management. These actions handle login, registration, password resets, and email verification.

## Files and Functions

### `login.ts`

**Function:** `login(data: z.infer<typeof LoginSchema>)`

Authenticates a user based on the provided credentials.

- **Parameters:**
  - `data`: An object containing `email` and `password`, validated against `LoginSchema`.
- **Process:**
  1. Validates the input fields.
  2. Checks if the user exists and has a password.
  3. Compares the provided password with the stored hashed password.
  4. If the user's email is not verified, generates a verification token and sends a verification email.
  5. If credentials are valid and email is verified, signs the user in using `next-auth`.
  6. Handles authentication errors (e.g., invalid credentials).
- **Returns:** An object with a `message` indicating the result (e.g., "Login successful!", "Invalid credentials!", "Confirmation email sent!").

### `logout.ts`

**Function:** `logout()`

Signs out the current user.

- **Process:** Calls the `signOut` function from `next-auth`.
- **Returns:** A promise that resolves when the user is signed out.

### `new-password.ts`

**Function:** `newPassword(data: z.infer<typeof NewPasswordSchema>, token?: string | null)`

Updates a user's password using a password reset token.

- **Parameters:**
  - `data`: An object containing the new `password`, validated against `NewPasswordSchema`.
  - `token`: The password reset token string.
- **Process:**
  1. Validates the token and the input fields.
  2. Checks if the token exists and has not expired.
  3. Retrieves the user associated with the token.
  4. Hashes the new password.
  5. Updates the user's password in the database.
  6. Deletes the used password reset token.
- **Returns:** An object with a `message` indicating the result (e.g., "Password changed successfully", "Invalid token").

### `new-verification.ts`

**Function:** `newVerification(token: string)`

Verifies a user's email address using a verification token.

- **Parameters:**
  - `token`: The verification token string.
- **Process:**
  1. Checks if the token exists and has not expired.
  2. Retrieves the user associated with the token.
  3. Updates the user's `emailVerified` field and `email` in the database.
  4. Deletes the used verification token.
- **Returns:** An object with a `message` indicating the result (e.g., "Email verified!", "Token does not exist!").

### `register.ts`

**Function:** `register(data: z.infer<typeof RegisterSchema>)`

Registers a new user.

- **Parameters:**
  - `data`: An object containing `email`, `password`, and `name`, validated against `RegisterSchema`.
- **Process:**
  1. Validates the input fields.
  2. Checks if the email is already in use.
  3. Hashes the password.
  4. Creates a new user in the database.
  5. Generates a verification token.
  6. Sends a verification email.
- **Returns:** An object with a `message` indicating the result (e.g., "Email Sent", "Email already in use!").

### `reset.ts`

**Function:** `reset(data: z.infer<typeof ResetSchema>)`

Initiates the password reset process for a user.

- **Parameters:**
  - `data`: An object containing the `email` of the user, validated against `ResetSchema`.
- **Process:**
  1. Validates the input fields.
  2. Checks if a user with the provided email exists.
  3. Generates a password reset token.
  4. Sends a password reset email.
- **Returns:** An object with a `message` indicating the result (e.g., "Email Sent").
