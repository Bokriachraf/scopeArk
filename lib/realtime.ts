import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Vrai si les variables d'environnement Supabase sont renseignées. */
export function realtimeConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

let client: SupabaseClient | null = null;

/** Client Supabase utilisé uniquement pour Realtime (Broadcast + Presence). */
export function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { params: { eventsPerSecond: 20 } },
      }
    );
  }
  return client;
}
