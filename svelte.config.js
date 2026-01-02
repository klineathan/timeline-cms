import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Netlify adapter options
			edge: false, // Set to true if you want to use Edge Functions (optional)
			split: false // Set to true to split functions (optional, for better performance)
		})
	}
};

export default config;
