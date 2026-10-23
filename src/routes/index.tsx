import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { lazy, Suspense } from 'react';
import { getCurrentProduct } from '@/lib/current-product';
import { productOrigin, type ProductId } from '@/lib/product-sites';

const HomePage = lazy(() => import('@/pages/HomePage'));
const productPages = {
	jsvm: lazy(() => import('@/products/jsvm/Page')),
	sakoa: lazy(() => import('@/products/sakoa/Page')),
	kato: lazy(() => import('@/products/kato/Page')),
	jsql: lazy(() => import('@/products/jsql/Page')),
	binzo: lazy(() => import('@/products/binzo/Page')),
	groundwork: lazy(() => import('@/products/groundwork/Page')),
	tuna: lazy(() => import('@/products/tuna/Page')),
};

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
	loader: async () => {
		const product = getCurrentProduct();
		return product
			? { product, home: null }
			: { product: null as ProductId | null, home: await getHomeData() };
	},
	head: () => {
		const product = getCurrentProduct();
		return { links: [{ rel: 'canonical', href: product ? productOrigin(product) : 'https://darylcecile.net' }] };
	},
	component: HomeRoute,
});

function HomeRoute() {
	const { product, home } = Route.useLoaderData();
	const ProductPage = product && productPages[product];
	return (
		<Suspense fallback={<main className="p-8" role="status">Loading…</main>}>
			{ProductPage ? <ProductPage /> : home ? <HomePage {...home} /> : null}
		</Suspense>
	);
}
