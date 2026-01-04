import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts, postMedia, media, apiKeys } from '$lib/server/db/schema';
import { eq, desc, and, gte, SQL } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

async function validateApiKey(request: Request): Promise<boolean> {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return false;
	}

	const apiKey = authHeader.slice(7);
	if (!apiKey) {
		return false;
	}

	// Get key prefix (first 8 chars)
	const keyPrefix = apiKey.slice(0, 8);

	// Find API key by prefix
	const [keyRecord] = await db
		.select()
		.from(apiKeys)
		.where(and(eq(apiKeys.keyPrefix, keyPrefix), eq(apiKeys.isActive, true)));

	if (!keyRecord) {
		return false;
	}

	// Check expiration
	if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
		return false;
	}

	// Verify hash (simple comparison - in production, use proper hashing)
	const encoder = new TextEncoder();
	const data = encoder.encode(apiKey);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

	if (hashHex !== keyRecord.keyHash) {
		return false;
	}

	// Update last used
	await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRecord.id));

	return true;
}

export const GET: RequestHandler = async ({ request, url }) => {
	// Validate API key
	const isValid = await validateApiKey(request);
	if (!isValid) {
		throw error(401, 'Invalid or missing API key');
	}

	// Pagination params
	const pageParam = url.searchParams.get('page');
	const limitParam = url.searchParams.get('limit');
	const page = pageParam ? parseInt(pageParam, 10) : 1;
	const limit = Math.min(limitParam ? parseInt(limitParam, 10) : 10, 100);
	const offset = (page - 1) * limit;

	// Only return published posts
	const postsData = await db
		.select({
			id: posts.id,
			title: posts.title,
			content: posts.content,
			excerpt: posts.excerpt,
			publishedAt: posts.publishedAt,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt
		})
		.from(posts)
		.where(eq(posts.status, 'published'))
		.orderBy(desc(posts.createdAt))
		.limit(limit)
		.offset(offset);

	// Get media for each post
	const postsWithMedia = await Promise.all(
		postsData.map(async (post) => {
			const mediaItems = await db
				.select({
					id: media.id,
					url: media.url,
					mediaType: media.mediaType,
					altText: media.altText,
					caption: media.caption,
					width: media.width,
					height: media.height
				})
				.from(postMedia)
				.innerJoin(media, eq(postMedia.mediaId, media.id))
				.where(eq(postMedia.postId, post.id))
				.orderBy(postMedia.order);

			return {
				...post,
				media: mediaItems
			};
		})
	);

	// Get total count
	const [countResult] = await db
		.select({ count: posts.id })
		.from(posts)
		.where(eq(posts.status, 'published'));

	return json({
		data: postsWithMedia,
		pagination: {
			page,
			limit,
			hasMore: offset + postsData.length < (countResult ? 1 : 0)
		}
	});
};

