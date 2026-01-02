import { createServerClient } from '@supabase/ssr';
import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

if (!env.SUPABASE_URL) throw new Error('SUPABASE_URL is not set');
if (!env.SUPABASE_ANON_KEY) throw new Error('SUPABASE_ANON_KEY is not set');

export function createSupabaseServerClient(cookies: Cookies) {
	return createServerClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	});
}

