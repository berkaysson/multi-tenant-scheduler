import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 1. Declare a module-level variable to hold the client instance
let supabase: SupabaseClient | null = null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates a Supabase client for client-side use.
 */
export const createSupabaseClient = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
        );
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
    });
};

/**
 * Get a Supabase client instance.
 * This creates a client *only* on the first call and reuses it.
 */
export const getSupabaseClient = () => {
    // 2. Check if the client already exists
    if (!supabase) {
        // 3. If not, create it and store it
        supabase = createSupabaseClient();
    }

    // 4. Return the single, stored instance
    return supabase;
};

/**
 * Authenticates the Supabase client with a custom JWT token.
 * This allows RLS policies to identify the user.
 */
export const authenticateSupabaseClient = async (accessToken: string): Promise<boolean> => {
    try {
        const client = getSupabaseClient();
        const { error } = await client.auth.setSession({
            access_token: accessToken,
            refresh_token: "",
        });
        
        if (error) {
            console.error("Failed to authenticate Supabase client:", error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error("Error authenticating Supabase client:", error);
        return false;
    }
};