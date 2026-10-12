import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import HomePage from '@/pages/HomePage';

const getHomeData = createServerFn({ method: 'GET' }).handler(async () => {
	const { getNotes, getPublicNotes } = await import('@/lib/repo/notesRepo');
	const { getIdeaSummaries } = await import('@/lib/repo/ideasRepo');
	const [notes, ideas] = await Promise.all([getNotes(), getIdeaSummaries()]);
	return {
		notes: getPublicNotes(7),
		notesCount: notes.filter(note => !note.metadata.hidden).length,
		latestIdea: ideas[0],
	};
});

export const Route = createFileRoute('/')({
	loader: () => getHomeData(),
	head: () => ({ links: [{ rel: 'canonical', href: 'https://darylcecile.net' }] }),
	component: HomeRoute,
});

function HomeRoute() {
	return <HomePage {...Route.useLoaderData()} />;
}
