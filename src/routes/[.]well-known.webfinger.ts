import { createFileRoute } from '@tanstack/react-router';
import { webfinger } from '@/lib/webfinger';

export const Route = createFileRoute('/.well-known/webfinger')({
	server: { handlers: { GET: ({ request }) => webfinger(request) } },
});
