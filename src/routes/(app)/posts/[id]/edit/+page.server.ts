import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts, postMedia, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const [post] = await db.select().from(posts).where(eq(posts.id, params.id));

	if (!post) {
		throw error(404, 'Post not found');
	}

	// Get associated media
	const mediaItems = await db
		.select({
			id: media.id,
			url: media.url,
			mediaType: media.mediaType,
			altText: media.altText,
			caption: media.caption
		})
		.from(postMedia)
		.innerJoin(media, eq(postMedia.mediaId, media.id))
		.where(eq(postMedia.postId, params.id))
		.orderBy(postMedia.order);

	return {
		post,
		media: mediaItems
	};
};

