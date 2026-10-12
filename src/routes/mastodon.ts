import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/mastodon')({
	server: { handlers: { GET: () => Response.redirect('https://techhub.social/@daryl', 308) } },
});
