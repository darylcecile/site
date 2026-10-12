import { createFileRoute } from '@tanstack/react-router';
import { generateOgResponse } from '@/lib/og.server';

export const Route = createFileRoute('/og')({
	server: {
		handlers: {
			GET: ({ request }) => generateOgResponse(request),
		},
	},
});
