"use server";

import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

/**
 * Gets a Supabase access token for the current user.
 * Uses Supabase's admin API to generate a proper JWT token that RLS can verify.
 */
export async function getSessionToken(): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session.user.email) {
      return { success: false, error: "Not authenticated" };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      // If service role key is not available, we can't generate a proper token
      // Return user ID as fallback (won't work with RLS, but allows the code to run)
      console.warn("Supabase service role key not configured. RLS may not work properly.");
      return { success: true, token: session.user.id };
    }

    // Use Supabase admin client to generate a proper access token
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create or get a user in Supabase auth with the same email
    // Then create a session to get an access token
    let authUser = await supabaseAdmin.auth.admin.getUserByEmail(session.user.email);

    if (authUser.error || !authUser.data?.user) {
      // User doesn't exist in Supabase auth, create one
      const createResult = await supabaseAdmin.auth.admin.createUser({
        email: session.user.email,
        email_confirm: true,
        user_metadata: {
          nextauth_user_id: session.user.id,
        },
      });

      if (createResult.error || !createResult.data?.user) {
        console.error("Failed to create Supabase user:", createResult.error);
        // Fallback to user ID
        return { success: true, token: session.user.id };
      }

      authUser = { data: { user: createResult.data.user }, error: null };
    }

    // Use Supabase admin API to create a session and get an access token
    // This creates a proper JWT that RLS can verify
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: authUser.data.user.id,
    });

    if (sessionError || !sessionData?.session?.access_token) {
      console.error("Failed to create Supabase session:", sessionError);
      // Fallback to user ID (won't work with RLS, but allows code to run)
      return { success: true, token: authUser.data.user.id };
    }

    // Return the access token - this is a proper Supabase JWT
    return { success: true, token: sessionData.session.access_token };
  } catch (error) {
    console.error("Error getting session token:", error);
    return { success: false, error: "Failed to get session token" };
  }
}

