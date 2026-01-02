import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts, postMedia } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { title, excerpt, content, contentJson, status, mediaIds } = body;

	const [newPost] = await db
		.insert(posts)
		.values({
			title: title || null,
			excerpt: excerpt || null,
			content: content || '',
			contentJson: contentJson || null,
			status: status || 'draft',
			publishedAt: status === 'published' ? new Date() : null,
			authorId: locals.session.user.id
		})
		.returning({ id: posts.id });

	// Link media files if any
	if (mediaIds && mediaIds.length > 0) {
		await db.insert(postMedia).values(
			mediaIds.map((mediaId: string, index: number) => ({
				postId: newPost.id,
				mediaId,
				order: index
			}))
		);
	}

	return json({ id: newPost.id });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	const postId = url.searchParams.get('id');
	if (!postId) {
		throw error(400, 'Post ID required');
	}

	await db.delete(posts).where(eq(posts.id, postId));

	return json({ success: true });
};

