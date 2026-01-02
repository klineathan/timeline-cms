import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const keys = await db
		.select({
			id: apiKeys.id,
			name: apiKeys.name,
			keyPrefix: apiKeys.keyPrefix,
			isActive: apiKeys.isActive,
			lastUsedAt: apiKeys.lastUsedAt,
			createdAt: apiKeys.createdAt
		})
		.from(apiKeys)
		.orderBy(desc(apiKeys.createdAt));

	return {
		apiKeys: keys
	};
};

