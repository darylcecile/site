import type { ReactNode } from 'react';
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { BookmarkCheckIcon, FolderCodeIcon, HomeIcon, LightbulbIcon, PenBoxIcon } from 'lucide-react';
import { ThemeProvider } from 'next-themes';
import { Nav, NavBackButton, NavItem, NavProvider, NavSearch, NavSearchPanel, NavContainer } from '@/components/nav';
import { Rays } from '@/components/header/rays';
import Footer from '@/components/footer';
import { GeistSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import Link from '@/components/utils/Link';
import BottomBlur from '@/components/effects/BottomBlur';
import BackgroundMotionGate from '@/components/effects/BackgroundMotionGate';
import appCss from '@/app/globals.css?url';

export const Route = createRootRoute({
	head: () => ({
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
	}),
	component: Outlet,
	shellComponent: RootDocument,
	notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
	return (
		<main className="mx-auto max-w-2xl px-8 pt-20 pb-12">
			<h1 className="text-3xl">Page not found</h1>
			<p className="mt-6 text-muted-foreground">This page could not be found.</p>
			<Link href="/" className="mt-6 inline-block underline underline-offset-4">Back to home</Link>
		</main>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head><HeadContent /></head>
			<body className={cn(GeistSans.className, 'bg-background w-full min-h-screen')}>
				<BackgroundMotionGate />
				<Rays className="w-full min-w-7xl -top-1/2 bg-center h-screen fixed opacity-50 pointer-events-none z-0" />
				<BottomBlur />
				<ThemeProvider attribute="class">
					<NavProvider>
						<NavContainer>
							<NavBackButton />
							<Nav>
								<NavItem label="Home" href="/"><HomeIcon className="size-4" /></NavItem>
								<NavItem label="Notes" href="/notes"><PenBoxIcon className="size-4" /></NavItem>
								<NavItem label="Projects" href="/projects"><FolderCodeIcon className="size-4" /></NavItem>
								<NavItem label="Ideas" href="/ideas"><LightbulbIcon className="size-4" /></NavItem>
								<NavItem label="Bookmarks" href="/bookmarks"><BookmarkCheckIcon className="size-4" /></NavItem>
								<NavSearch />
								<NavSearchPanel />
							</Nav>
						</NavContainer>
						<div className="z-2">{children}</div>
					</NavProvider>
					<Footer />
				</ThemeProvider>
				<img className="hidden u-photo" src="/icon.png" alt="" />
				<Scripts />
			</body>
		</html>
	);
}
