# Notification Actions

This directory contains server actions for managing notifications in the application. These actions handle creating, retrieving, updating, and deleting notifications.

## Files and Functions

### `delete-notification.ts`

Handles the deletion of notifications.

- **`deleteNotification(notificationId: string)`**
  - **Purpose**: Deletes a specific notification.
  - **Parameters**:
    - `notificationId`: The ID of the notification to delete.
  - **Returns**: A promise resolving to an object with `success` (boolean) and `message` (string).
  - **Logic**:
    - Authenticates the user.
    - Verifies that the notification belongs to the authenticated user.
    - Deletes the notification from the database.

### `get-notifications.ts`

Handles retrieving notifications for the current user.

- **`getNotifications(options?: { limit?: number; offset?: number; read?: boolean; })`**

  - **Purpose**: Fetches a list of notifications for the authenticated user.
  - **Parameters**:
    - `options`: An optional object containing:
      - `limit`: Number of notifications to retrieve (default: 20).
      - `offset`: Number of notifications to skip (default: 0).
      - `read`: Filter by read status (optional).
  - **Returns**: A promise resolving to an object containing the list of `notifications`, `total` count, `unreadCount`, and a `hasMore` flag.

- **`getUnreadNotificationCount()`**
  - **Purpose**: Retrieves the count of unread notifications for the authenticated user.
  - **Returns**: A promise resolving to an object with `success` (boolean) and the `count` (number).

### `mark-notification-read.ts`

Handles updating the read status of notifications.

- **`markNotificationRead(notificationId: string, read: boolean)`**

  - **Purpose**: Marks a specific notification as read or unread.
  - **Parameters**:
    - `notificationId`: The ID of the notification.
    - `read`: Boolean indicating whether to mark as read (`true`) or unread (`false`).
  - **Returns**: A promise resolving to the operation result, including the updated notification.

- **`markAllNotificationsRead()`**
  - **Purpose**: Marks all unread notifications for the current user as read.
  - **Returns**: A promise resolving to the operation result, including the count of updated notifications.

### `notifications.ts`

Handles the creation of notifications.

- **`createOrganizationNotifications(organizationId: string, appointmentId: string, type: NotificationType, title: string, message: string)`**

  - **Purpose**: Creates notifications for an organization's owner and all its members.
  - **Parameters**:
    - `organizationId`: The ID of the organization.
    - `appointmentId`: The ID of the associated appointment.
    - `type`: The type of notification (e.g., `NotificationType`).
    - `title`: The title of the notification.
    - `message`: The body message of the notification.
  - **Logic**:
    - Fetches the organization's owner and members.
    - Creates a notification for each unique user found.

- **`createUserNotification(userId: string, organizationId: string, appointmentId: string, type: NotificationType, title: string, message: string)`**
  - **Purpose**: Creates a notification for a specific user.
  - **Parameters**:
    - `userId`: The ID of the recipient user.
    - `organizationId`: The ID of the organization.
    - `appointmentId`: The ID of the associated appointment.
    - `type`: The type of notification.
    - `title`: The title of the notification.
    - `message`: The body message of the notification.
