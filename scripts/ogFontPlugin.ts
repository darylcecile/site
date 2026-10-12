import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

// @vercel/og's edge entry fetches its fallback font at module initialization.
// Workers prohibit that I/O; embed the bundled font instead, before Vite rewrites URLs.
export function ogFontPlugin(): Plugin {
	return {
		name: 'og-worker-font',
		enforce: 'pre',
		transform(code, id) {
			if (!id.endsWith('/@vercel/og/dist/index.edge.js')) return;
			const initializer = /var fallbackFont = fetch\(\s*new URL\("\.\/noto-sans-v27-latin-regular\.ttf", import\.meta\.url\)\s*\)\.then\(\(res\) => res\.arrayBuffer\(\)\);/;
			if (!initializer.test(code)) {
				throw new Error('@vercel/og changed its fallback font loader; update ogFontPlugin before deploying.');
			}
			const font = readFileSync(join(dirname(id), 'noto-sans-v27-latin-regular.ttf')).toString('base64');
			return {
				code: code.replace(initializer, `var fallbackFont = Promise.resolve(Uint8Array.from(atob(${JSON.stringify(font)}), c => c.charCodeAt(0)).buffer);`),
				map: null,
			};
		},
	};
}
