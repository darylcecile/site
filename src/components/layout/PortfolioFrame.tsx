import type { ReactNode } from 'react';
import { BookmarkCheckIcon, FolderCodeIcon, HomeIcon, LightbulbIcon, PenBoxIcon } from 'lucide-react';
import { Nav, NavBackButton, NavItem, NavProvider, NavSearch, NavSearchPanel, NavContainer } from '@/components/nav';
import { Rays } from '@/components/header/rays';
import Footer from '@/components/footer';
import BottomBlur from '@/components/effects/BottomBlur';
import BackgroundMotionGate from '@/components/effects/BackgroundMotionGate';
import '@/lib/fonts';

export default function PortfolioFrame({ children }: { children: ReactNode }) {
	return (
		<>
			<BackgroundMotionGate />
			<Rays className="w-full min-w-7xl -top-1/2 bg-center h-screen fixed opacity-50 pointer-events-none z-0" />
			<BottomBlur />
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
			<img className="hidden u-photo" src="/icon.png" alt="" />
		</>
	);
}
