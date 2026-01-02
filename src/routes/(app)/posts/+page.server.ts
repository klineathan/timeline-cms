import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { eq, desc, asc, ilike, count, and, or, SQL } from 'drizzle-orm';

const POSTS_PER_PAGE = 10;

export const load: PageServerLoad = async ({ url }) => {
	const pageParam = url.searchParams.get('page');
	const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || 'all';
	const sortBy = url.searchParams.get('sort') || 'createdAt';
	const sortOrder = url.searchParams.get('order') || 'desc';

	// Build where conditions
	const conditions: SQL[] = [];

	if (search) {
		conditions.push(
			or(ilike(posts.title, `%${search}%`), ilike(posts.excerpt, `%${search}%`)) as SQL
		);
	}

	if (status !== 'all') {
		conditions.push(eq(posts.status, status as 'draft' | 'published' | 'archived'));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	// Get total count
	const [totalResult] = await db
		.select({ count: count() })
		.from(posts)
		.where(whereClause);

	const totalPosts = totalResult?.count ?? 0;
	const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
	const offset = (currentPage - 1) * POSTS_PER_PAGE;

	// Build order
	const sortColumn =
		sortBy === 'title' ? posts.title : sortBy === 'updatedAt' ? posts.updatedAt : posts.createdAt;
	const orderFn = sortOrder === 'asc' ? asc : desc;

	// Get posts
	const postsData = await db
		.select({
			id: posts.id,
			title: posts.title,
			excerpt: posts.excerpt,
			status: posts.status,
			createdAt: posts.createdAt,
			updatedAt: posts.updatedAt
		})
		.from(posts)
		.where(whereClause)
		.orderBy(orderFn(sortColumn))
		.limit(POSTS_PER_PAGE)
		.offset(offset);

	return {
		posts: postsData,
		currentPage,
		totalPages,
		totalPosts
	};
};

