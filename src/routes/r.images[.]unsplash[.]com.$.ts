import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/r/images.unsplash.com/$')({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const url = new URL('https://images.unsplash.com');
				url.pathname = `/${params._splat ?? ''}`;
				url.search = new URL(request.url).search;
				try {
					return await fetch(url, { signal: AbortSignal.timeout(10_000) });
				} catch {
					return new Response('Image unavailable', { status: 502 });
				}
			},
		},
	},
});
