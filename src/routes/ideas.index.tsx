import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import IdeasPage from '@/pages/IdeasPage';

const getIdeasData = createServerFn({ method: 'GET' }).handler(async () => {
	const { getIdeaSummaries } = await import('@/lib/repo/ideasRepo');
	return getIdeaSummaries();
});

export const Route = createFileRoute('/ideas/')({
	loader: () => getIdeasData(),
	head: () => ({
		meta: [
			{ title: 'Ideas — Daryl Cecile' },
			{ name: 'description', content: 'A working notebook for ideas, experiments, and things I want to understand by building them.' },
			{ property: 'og:title', content: 'Ideas — Daryl Cecile' },
			{ property: 'og:image', content: 'https://darylcecile.net/og?page=ideas' },
			{ name: 'twitter:title', content: 'Ideas — Daryl Cecile' },
			{ name: 'twitter:image', content: 'https://darylcecile.net/og?page=ideas' },
		],
		links: [{ rel: 'canonical', href: 'https://darylcecile.net/ideas' }],
	}),
	component: IdeasRoute,
});

function IdeasRoute() {
	return <IdeasPage ideas={Route.useLoaderData()} />;
}
