import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	// Get media record
	const [mediaRecord] = await db.select().from(media).where(eq(media.id, params.id));

	if (!mediaRecord) {
		throw error(404, 'Media not found');
	}

	// Delete from storage
	const { error: storageError } = await locals.supabase.storage
		.from('media')
		.remove([mediaRecord.storagePath]);

	if (storageError) {
		console.error('Storage delete error:', storageError);
	}

	// Delete from database
	await db.delete(media).where(eq(media.id, params.id));

	return json({ success: true });
};

