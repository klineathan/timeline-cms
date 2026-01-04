import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';

// Increase body size limit for video uploads (100MB)
export const config = {
	bodySize: '100mb'
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const file = formData.get('file') as File;

	if (!file) {
		throw error(400, 'No file provided');
	}

	// Determine media type
	let mediaType: 'image' | 'video' | 'audio';
	if (file.type.startsWith('image/')) {
		mediaType = 'image';
	} else if (file.type.startsWith('video/')) {
		mediaType = 'video';
	} else if (file.type.startsWith('audio/')) {
		mediaType = 'audio';
	} else {
		throw error(400, 'Unsupported file type');
	}

	// Generate unique filename
	const ext = file.name.split('.').pop();
	const filename = `${crypto.randomUUID()}.${ext}`;
	const storagePath = `uploads/${filename}`;

	// Upload to Supabase Storage
	const { data: uploadData, error: uploadError } = await locals.supabase.storage
		.from('media')
		.upload(storagePath, file, {
			contentType: file.type,
			upsert: false
		});

	if (uploadError) {
		console.error('Upload error:', uploadError);
		throw error(500, 'Failed to upload file');
	}

	// Get public URL
	const { data: urlData } = locals.supabase.storage.from('media').getPublicUrl(storagePath);

	// Save to database
	const [newMedia] = await db
		.insert(media)
		.values({
			filename,
			originalFilename: file.name,
			mimeType: file.type,
			size: file.size,
			url: urlData.publicUrl,
			storagePath,
			mediaType,
			uploadedBy: locals.session.user.id
		})
		.returning({ id: media.id });

	return json({ mediaId: newMedia.id, url: urlData.publicUrl });
};

