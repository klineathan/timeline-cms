import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts, media } from '$lib/server/db/schema';
import { eq, desc, count } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.session!.user.id;

	// Get stats
	const [totalPostsResult] = await db.select({ count: count() }).from(posts);
	const [publishedPostsResult] = await db
		.select({ count: count() })
		.from(posts)
		.where(eq(posts.status, 'published'));
	const [draftPostsResult] = await db
		.select({ count: count() })
		.from(posts)
		.where(eq(posts.status, 'draft'));
	const [totalMediaResult] = await db.select({ count: count() }).from(media);

	// Get recent posts
	const recentPosts = await db
		.select({
			id: posts.id,
			title: posts.title,
			excerpt: posts.excerpt,
			status: posts.status,
			createdAt: posts.createdAt
		})
		.from(posts)
		.orderBy(desc(posts.createdAt))
		.limit(5);

	return {
		stats: {
			totalPosts: totalPostsResult?.count ?? 0,
			publishedPosts: publishedPostsResult?.count ?? 0,
			draftPosts: draftPostsResult?.count ?? 0,
			totalMedia: totalMediaResult?.count ?? 0
		},
		recentPosts
	};
};

