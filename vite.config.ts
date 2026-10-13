import { execFileSync } from 'node:child_process';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { ogFontPlugin } from './scripts/ogFontPlugin.ts';
import { portlessProductsPlugin } from './scripts/portlessProductsPlugin.ts';

export default defineConfig(({ isPreview }) => {
	// cf invokes Vite directly, so content generation belongs here rather than
	// in an npm lifecycle hook. Preview serves the already-built content.
	if (!isPreview) {
		execFileSync('bun', ['run', 'scripts/contentBuilder.ts'], { stdio: 'inherit' });
		execFileSync('bun', ['run', 'scripts/feedBuilder.ts'], { stdio: 'inherit' });
	}

	return {
		server: {
			port: Number(process.env.PORT ?? 3000),
			strictPort: true,
		},
		preview: { port: 3000 },
		resolve: { tsconfigPaths: true },
		// The OG font transform must also run in development, before dependency bundling.
		environments: { ssr: { optimizeDeps: { exclude: ['@vercel/og'] } } },
		plugins: [
			portlessProductsPlugin(),
			ogFontPlugin(),
			cloudflare({ viteEnvironment: { name: 'ssr' } }),
			tanstackStart(),
			react(),
		],
	};
});
