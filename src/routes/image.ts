import { createFileRoute } from '@tanstack/react-router';
import { transformImage } from '@/lib/images.server';

const widths = new Set([192, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]);

export const Route = createFileRoute('/image')({
	server: {
		handlers: {
			GET: ({ request }) => {
				const query = new URL(request.url).searchParams;
				const source = query.get('url');
				const width = Number(query.get('w') ?? 1080);
				const quality = Number(query.get('q') ?? 80);
				if (!source || !widths.has(width) || !Number.isInteger(quality) || quality < 1 || quality > 100) {
					return new Response('Invalid image parameters', { status: 400 });
				}
				return transformImage(request, source, width, quality);
			},
		},
	},
});
