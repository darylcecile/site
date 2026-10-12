import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/twitter')({
	server: { handlers: { GET: () => Response.redirect('https://twitter.com/darylcecile', 308) } },
});
