import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
}

const isConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isConfigured
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: null, error: null }),
                    maybeSingle: () => Promise.resolve({ data: null, error: null }),
                }),
                order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
            }),
            upsert: () => Promise.resolve({ error: null }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        }),
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
            signUp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        rpc: () => Promise.resolve({ data: null, error: null }),
    } as any;
