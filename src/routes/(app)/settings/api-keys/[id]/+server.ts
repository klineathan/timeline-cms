import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	await db.delete(apiKeys).where(eq(apiKeys.id, params.id));

	return json({ success: true });
};

