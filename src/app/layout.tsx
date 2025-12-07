import { BookmarkCheckIcon, FolderCodeIcon, HomeIcon, PenBoxIcon, ScrollIcon, ScrollTextIcon } from 'lucide-react';
import { Nav, NavBackButton, NavItem, NavProvider } from '@/components/nav';
import { NavSearch, NavSearchPanel, NavContainer } from '@/components/nav/index';
import "./globals.css";
import { ThemeProvider } from 'next-themes'
import { Rays } from '@/components/header/rays';
import Footer from '@/components/footer/index';
import { GeistSans } from "geist/font/sans";
import { cn } from '@/lib/utils';
import { Analytics } from "@vercel/analytics/react"
import { Metadata, Viewport } from 'next';

export async function generateViewport(): Promise<Viewport[]> {
	return [{ minimumScale: 1, initialScale: 1, width: "device-width" }];
}

export async function generateMetadata(): Promise<Metadata> {
	return {
		metadataBase: new URL("https://darylcecile.net/"),
		alternates: {
			canonical: "https://darylcecile.net",
			types: {
				"application/rss+xml": [
					{ title: "RSS Feed for darylcecile.net", url: "/rss.xml" },
				],
			},
		},
		title: "Daryl Cecile",
		authors: { name: "Daryl Cecile", url: "https://darylcecile.net" },
		description: "Building experiences on the web 🍊",
		openGraph: {
			title: "Daryl Cecile",
			images: ["https://darylcecile.net/og"],
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title: "Daryl Cecile",
			images: "https://darylcecile.net/og",
			site: "@darylcecile",
			creator: "@darylcecile",
			description: "Building experiences on the web 🍊",
		},
		icons: {
			apple: {
				sizes: "180x180",
				url: "/images/core/profile-180.png",
			},
			icon: [
				{
					url: "/images/core/profile-64.png",
					sizes: "64x64",
					type: "image/png",
				},
				{
					url: "/images/core/profile-128.png",
					sizes: "128x128",
					type: "image/png",
				},
				{
					url: "/images/core/profile-256.png",
					sizes: "256x256",
					type: "image/png",
				},
				{
					url: "/images/core/profile-512.png",
					sizes: "512x512",
					type: "image/png",
				},
				{
					url: "/images/core/profile.png",
					type: "image/png",
				}
			],
			shortcut: ["/images/core/profile-256.ico"],
			other: [
				{ rel: "me", url: "https://twitter.com/darylcecile" },
				{
					rel: "webmention",
					url: "https://webmention.io/darylcecile.net/webmention",
				},
				{
					rel: "pingback",
					url: "https://webmention.io/darylcecile.net/xmlrpc",
				},
				{
					rel: "me",
					url: "https://github.com/darylcecile"
				}
			],
		}
		// manifest: "/site.webmanifest",
	} satisfies Metadata;
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn(GeistSans.className, 'bg-background w-full min-h-screen')}>
				<Analytics />
				<Rays className="w-full min-w-7xl -top-1/2 bg-center h-screen fixed opacity-50 pointer-events-none z-0" />
				{/* TOP PROGRESSIVE BLUR */}
				{/* <div
					className="w-full h-20 -top-5 left-0 fixed pointer-events-none z-40"
					style={{
						mask: 'linear-gradient(black, black, transparent)',
						backdropFilter: 'blur(4px) saturate(180%)',
					}}
				/> */}

				{/* DOTTED GRID MESH GRADIENT */}
				{/* <div
					style={{
						backgroundColor: 'transparent',
						backgroundImage: 'radial-gradient(transparent 1px, var(--background, #ffffff) 1px)',
						backgroundSize: '4px 4px',
						backdropFilter: 'blur(3px)',
						WebkitBackdropFilter: 'blur(3px)',
						mask: 'linear-gradient(rgb(0, 0, 0) 30%, rgba(0, 0, 0, 0) 95%, transparent 100%)',
						maskSize: 'auto',
						maskComposite: 'add',
						maskMode: 'match-source',
						opacity: 1,
					}}
					className='fixed top-0 left-0 w-full h-[100px] z-10 pointer-events-none'
				/> */}

				<div
					className="w-full h-[100px] bottom-0 fixed pointer-events-none z-40"
					style={{
						mask: 'linear-gradient(transparent, black, black)',
						backdropFilter: 'blur(4px) saturate(180%)',
					}}
				/>
				<ThemeProvider attribute={'class'}>
					{/* <ClientTheme /> */}
					<NavProvider>
						<NavContainer>
							<NavBackButton />

							<Nav>
								<NavItem label="Home" href="/">
									<HomeIcon className="size-4" />
								</NavItem>
								<NavItem label="Notes" href="/notes">
									<PenBoxIcon className="size-4" />
								</NavItem>
								<NavItem label="Projects" href="/projects">
									<FolderCodeIcon className="size-4" />
								</NavItem>
									<NavItem label="Bookmarks" href="/bookmarks">
										<BookmarkCheckIcon className="size-4" />
									</NavItem>
								<NavSearch />
								<NavSearchPanel />
							</Nav>
						</NavContainer>

						<div className='z-2'>
							{children}
						</div>

					</NavProvider>
					<Footer />
				</ThemeProvider>
				<img className="hidden u-photo" src="/icon.png" alt=""/>
			</body>
		</html>
	)
}
