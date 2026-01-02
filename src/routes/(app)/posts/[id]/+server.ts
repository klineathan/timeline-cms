import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts, postMedia } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	await db.delete(posts).where(eq(posts.id, params.id));

	return json({ success: true });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { title, excerpt, content, contentJson, status, mediaIds } = body;

	const [updatedPost] = await db
		.update(posts)
		.set({
			title: title || null,
			excerpt: excerpt || null,
			content: content || '',
			contentJson: contentJson || null,
			status: status || 'draft',
			publishedAt: status === 'published' ? new Date() : null,
			updatedAt: new Date()
		})
		.where(eq(posts.id, params.id))
		.returning({ id: posts.id });

	if (!updatedPost) {
		throw error(404, 'Post not found');
	}

	// Update media associations
	if (mediaIds !== undefined) {
		// Remove existing associations
		await db.delete(postMedia).where(eq(postMedia.postId, params.id));

		// Add new associations
		if (mediaIds.length > 0) {
			await db.insert(postMedia).values(
				mediaIds.map((mediaId: string, index: number) => ({
					postId: params.id,
					mediaId,
					order: index
				}))
			);
		}
	}

	return json({ id: updatedPost.id });
};

