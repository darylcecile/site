import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/github')({
	server: { handlers: { GET: () => Response.redirect('https://github.com/darylcecile', 308) } },
});
