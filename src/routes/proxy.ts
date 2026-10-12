import { createFileRoute } from '@tanstack/react-router';
import { transformImage } from '@/lib/images.server';

export const Route = createFileRoute('/proxy')({
	server: {
		handlers: {
			GET: ({ request }) => {
				const query = new URL(request.url).searchParams;
				const encoded = query.get('u');
				let source = query.get('url');
				try {
					source ||= encoded ? atob(encoded) : null;
				} catch {
					return new Response('Invalid image URL', { status: 400 });
				}
				if (!source) return new Response('Missing image URL', { status: 400 });
				return transformImage(request, source, 600);
			},
		},
	},
});
