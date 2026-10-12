import { createFileRoute } from '@tanstack/react-router';
import BookmarksPage from '@/pages/BookmarksPage';

export const Route = createFileRoute('/bookmarks')({
	head: () => ({ links: [{ rel: 'canonical', href: 'https://darylcecile.net/bookmarks' }] }),
	component: BookmarksPage,
});
