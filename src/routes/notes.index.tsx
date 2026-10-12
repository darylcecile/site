import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import NotesPage from '@/pages/NotesPage';

const getNotesData = createServerFn({ method: 'GET' }).handler(async () => {
	const { getPublicNotes } = await import('@/lib/repo/notesRepo');
	return getPublicNotes();
});

export const Route = createFileRoute('/notes/')({
	loader: () => getNotesData(),
	head: () => ({ links: [{ rel: 'canonical', href: 'https://darylcecile.net/notes' }] }),
	component: NotesRoute,
});

function NotesRoute() {
	return <NotesPage notes={Route.useLoaderData()} />;
}
