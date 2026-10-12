import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import NotePage from '@/pages/NotePage';

const getNoteData = createServerFn({ method: 'GET' })
	.validator((slug: string) => {
		if (typeof slug !== 'string' || !slug) throw notFound();
		return slug;
	})
	.handler(async ({ data: slug }) => {
		const { getNotePage } = await import('@/lib/repo/notesRepo');
		const note = await getNotePage(slug);
		if (!note) throw notFound();
		return note;
	});

export const Route = createFileRoute('/notes/$slug')({
	loader: ({ params }) => getNoteData({ data: params.slug }),
	head: ({ loaderData: note }) => {
		if (!note) return {};
		const { title, snippet } = note.metadata;
		const image = `https://darylcecile.net/og?slug=${note.slug}`;
		return {
			meta: [
				{ title },
				{ name: 'description', content: snippet },
				{ property: 'og:title', content: title },
				{ property: 'og:image', content: image },
				{ name: 'twitter:title', content: title },
				{ name: 'twitter:description', content: snippet },
				{ name: 'twitter:image', content: image },
			],
			links: [{ rel: 'canonical', href: `https://darylcecile.net/notes/${note.slug}` }],
		};
	},
	component: NoteRoute,
});

function NoteRoute() {
	return <NotePage note={Route.useLoaderData()} />;
}
