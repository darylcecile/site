import { execFileSync } from 'node:child_process';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { ogFontPlugin } from './scripts/ogFontPlugin.ts';

export default defineConfig(({ isPreview }) => {
	// cf invokes Vite directly, so content generation belongs here rather than
	// in an npm lifecycle hook. Preview serves the already-built content.
	if (!isPreview) {
		execFileSync('bun', ['run', 'scripts/contentBuilder.ts'], { stdio: 'inherit' });
		execFileSync('bun', ['run', 'scripts/feedBuilder.ts'], { stdio: 'inherit' });
	}

	return {
		server: { port: 3000 },
		preview: { port: 3000 },
		resolve: { tsconfigPaths: true },
		plugins: [
			ogFontPlugin(),
			cloudflare({ viteEnvironment: { name: 'ssr' } }),
			tanstackStart(),
			react(),
		],
	};
});
