"use client";

import { getSupabaseClient } from "@/lib/supabase";

/**
 * Subscribes to real-time notification updates for a user.
 * The Supabase client must be authenticated before calling this function.
 *
 * @param {string} userId - User ID to subscribe to notifications for.
 * @param {Function} onUpdate - Callback function called when notifications change.
 * @returns {Function} Cleanup function to unsubscribe.
 */
export const subscribeToNotifications = (
    userId: string,
    onUpdate: () => void
): (() => void) => {
    console.log("Subscribing to notifications for user:", userId);
    let channel: any = null;
    let supabaseInstance: ReturnType<typeof getSupabaseClient> | null = null;

    try {
        supabaseInstance = getSupabaseClient();

        // Subscribe to notification changes for this user
        channel = supabaseInstance
            .channel(`notifications-${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log("Real-time notification update:", payload);
                    // Call the update callback when notifications change
                    onUpdate();
                }
            )
            .subscribe();

        // Return cleanup function
        return () => {
            if (channel && supabaseInstance) {
                supabaseInstance.removeChannel(channel);
            }
        };
    } catch (error) {
        // If Supabase is not configured, just log a warning and return no-op cleanup
        console.warn("Supabase not configured, real-time notifications disabled:", error);
        return () => {
            // No-op cleanup function
        };
    }
};

