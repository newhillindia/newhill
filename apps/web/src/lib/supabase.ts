import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Client-side Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies });
};

// Client component Supabase client
export const createClientSupabaseClient = () => {
  return createClientComponentClient();
};

// Admin Supabase client (for server-side operations)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types (you can generate these with: npx supabase gen types typescript)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: 'ADMIN' | 'B2B' | 'B2C';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          role?: 'ADMIN' | 'B2B' | 'B2C';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: 'ADMIN' | 'B2B' | 'B2C';
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          images: string[];
          organic_certified: boolean;
          default_currency: string;
          status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          images?: string[];
          organic_certified?: boolean;
          default_currency?: string;
          status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          images?: string[];
          organic_certified?: boolean;
          default_currency?: string;
          status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};


