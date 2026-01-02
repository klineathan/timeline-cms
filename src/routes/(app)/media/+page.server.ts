import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const mediaItems = await db
		.select()
		.from(media)
		.orderBy(desc(media.createdAt));

	return {
		media: mediaItems
	};
};

