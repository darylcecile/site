import { createFileRoute } from '@tanstack/react-router';
import { generateOgImage } from '@/lib/og.server';

export const Route = createFileRoute('/og')({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const image = await generateOgImage(request);
					if (!image.ok) return image;
					const bytes = await image.arrayBuffer();
					if (!bytes.byteLength) throw new Error('Social image renderer returned an empty image.');
					return new Response(bytes, {
						headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
					});
				} catch (error) {
					console.error('[og] Rendering failed', error instanceof Error ? error.message : error);
					return new Response('Social image unavailable', { status: 502 });
				}
			},
		},
	},
});
