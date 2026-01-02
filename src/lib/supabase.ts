import { createBrowserClient } from '@supabase/ssr';
import { browser } from '$app/environment';

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
	if (!browser) {
		throw new Error('getSupabaseClient can only be called in the browser');
	}

	if (!supabaseInstance) {
		const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
		const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

		if (!supabaseUrl || !supabaseAnonKey) {
			throw new Error('Missing Supabase environment variables');
		}

		supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
	}

	return supabaseInstance;
}

