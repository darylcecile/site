import { lazy, Suspense, type ReactNode } from 'react';
import { createRootRoute, HeadContent, notFound, Outlet, Scripts } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Link from '@/components/utils/Link';
import { getCurrentProduct } from '@/lib/current-product';
import { productOrigin } from '@/lib/product-sites';
import { productIdentity, productMetadata, productNames } from '@/products/registry';
import appCss from '@/app/globals.css?url';

const PortfolioFrame = lazy(() => import('@/components/layout/PortfolioFrame'));

export const Route = createRootRoute({
	beforeLoad: ({ location }) => {
		if (getCurrentProduct() && location.pathname !== '/') throw notFound();
	},
	head: () => {
		const product = getCurrentProduct();
		if (product) {
			const { title, description } = productMetadata[product];
			const origin = productOrigin(product);
			return {
				meta: [
					{ charSet: 'utf-8' },
					{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
					{ title },
					{ name: 'description', content: description },
					{ name: 'theme-color', content: productIdentity[product].accent },
					{ property: 'og:title', content: title },
					{ property: 'og:description', content: description },
					{ property: 'og:type', content: 'website' },
					{ property: 'og:url', content: origin },
					{ property: 'og:image', content: `${origin}/og` },
					{ name: 'twitter:card', content: 'summary_large_image' },
					{ name: 'twitter:title', content: title },
					{ name: 'twitter:description', content: description },
					{ name: 'twitter:image', content: `${origin}/og` },
				],
				links: [
					{ rel: 'stylesheet', href: appCss },
					{ rel: 'author', href: 'https://darylcecile.net' },
					{ rel: 'icon', type: 'image/svg+xml', href: `/product-icons/${product}.svg` },
				],
			};
		}
		return {
			meta: [
				{ charSet: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1, minimum-scale=1' },
				{ title: 'Daryl Cecile' },
				{ name: 'author', content: 'Daryl Cecile' },
				{ name: 'description', content: 'Building experiences on the web 🍊' },
				{ property: 'og:title', content: 'Daryl Cecile' },
				{ property: 'og:image', content: 'https://darylcecile.net/og' },
				{ property: 'og:locale', content: 'en_US' },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:title', content: 'Daryl Cecile' },
				{ name: 'twitter:image', content: 'https://darylcecile.net/og' },
				{ name: 'twitter:site', content: '@darylcecile' },
				{ name: 'twitter:creator', content: '@darylcecile' },
				{ name: 'twitter:description', content: 'Building experiences on the web 🍊' },
			],
			links: [
				{ rel: 'stylesheet', href: appCss },
				{ rel: 'author', href: 'https://darylcecile.net' },
				{ rel: 'alternate', type: 'application/rss+xml', title: 'RSS Feed for darylcecile.net', href: '/rss.xml' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/images/core/profile-180.png' },
				...[64, 128, 256, 512].map(size => ({ rel: 'icon', type: 'image/png', sizes: `${size}x${size}`, href: `/images/core/profile-${size}.png` })),
				{ rel: 'icon', type: 'image/png', href: '/images/core/profile.png' },
				{ rel: 'shortcut icon', href: '/images/core/profile-256.ico' },
				{ rel: 'me', href: 'https://twitter.com/darylcecile' },
				{ rel: 'me', href: 'https://github.com/darylcecile' },
				{ rel: 'webmention', href: 'https://webmention.io/darylcecile.net/webmention' },
				{ rel: 'pingback', href: 'https://webmention.io/darylcecile.net/xmlrpc' },
			],
		};
	},
	component: Outlet,
	shellComponent: RootDocument,
	notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
	const product = getCurrentProduct();
	return (
		<main className="mx-auto max-w-2xl px-8 pt-20 pb-12">
			<h1 className="text-3xl">Page not found</h1>
			<p className="mt-6 text-muted-foreground">This page could not be found.</p>
			<Link href="/" className="mt-6 inline-block underline underline-offset-4">Back to {product ? productNames[product] : 'home'}</Link>
		</main>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	const product = getCurrentProduct();
	return (
		<html lang="en" suppressHydrationWarning>
			<head><HeadContent /></head>
			<body className="font-sans bg-background w-full min-h-screen">
				<ThemeProvider attribute="class">
					{product ? children : (
						<Suspense fallback={<div className="p-8" role="status">Loading…</div>}>
							<PortfolioFrame>{children}</PortfolioFrame>
						</Suspense>
					)}
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
