import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema';

function generateApiKey(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = 'tlcms_';
	for (let i = 0; i < 32; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

async function hashApiKey(apiKey: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(apiKey);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { name } = body;

	if (!name || typeof name !== 'string') {
		throw error(400, 'Name is required');
	}

	// Generate a new API key
	const apiKey = generateApiKey();
	const keyHash = await hashApiKey(apiKey);
	const keyPrefix = apiKey.slice(0, 8);

	await db.insert(apiKeys).values({
		name,
		keyHash,
		keyPrefix,
		createdBy: locals.session.user.id
	});

	// Return the plain API key (only shown once)
	return json({ apiKey });
};

