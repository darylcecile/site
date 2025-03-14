"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { createContext, type Dispatch, type SetStateAction, use, useCallback, useRef, useState, type PropsWithChildren, useId } from "react";
import * as motion from "motion/react-client";
import { usePathname } from 'next/navigation';
import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import { useResize } from "@/lib/hooks/useResize";
import { createPortal } from 'react-dom';
import { useMounted } from "@/lib/hooks/useMounted";

type NavContextType = {
	isSearchActive: boolean;
	setIsSearchActive: Dispatch<SetStateAction<boolean>>;
	portalId: string
}

const NavContext = createContext<NavContextType>(null);

export function Nav(props: PropsWithChildren) {
	const [isSearchActive, setIsSearchActive] = useState(false);
	const portalId = useId();

	return (
		<NavContext.Provider value={{
			isSearchActive,
			setIsSearchActive,
			portalId
		}}>
			<motion.nav
				className={cn(
					"fixed left-1/2 -translate-x-1/2 p-2 rounded-full overflow-hidden shadow-2xl",
					"bg-muted/90 backdrop-blur-2xl z-50"
				)}
				initial={{ bottom: -100, scale: 0.5 }}
				animate={{ bottom: 16, scale: 1 }}
				transition={{ type: 'spring' }}
			>
				<ul className="flex justify-between  gap-2">
					{props.children}
				</ul>
			</motion.nav>
			<div id={portalId} />
		</NavContext.Provider>
	);
}

function useNav() {
	return use(NavContext)
}

type NavItemProps = PropsWithChildren<{
	active?: boolean;
	label: string;
	href: string;
}>;

export function NavItem(props: NavItemProps) {
	const navContext = useNav();
	const pathName = usePathname();
	const isActive = !navContext.isSearchActive && (props.active || pathName === props.href);
	const ref = useRef<HTMLLIElement>(null);

	const clickHandler = useCallback(() => {
		navContext.setIsSearchActive(false);
	}, [navContext]);

	return (
		<motion.li
			ref={ref}
			className={cn(
				"rounded-full hover:bg-neutral-600  text-foreground overflow-hidden border border-transparent min-w-8",
				{
					"bg-transparent": !isActive,
					"bg-background": isActive
				}
			)}
			variants={{
				active: {
					maxWidth: 200,
					opacity: 1
				},
				inactive: {
					maxWidth: 32,
					opacity: 1
				},
				hidden: {
					marginLeft: -40,
					maxWidth: 32,
					opacity: 0
				}
			}}
			transition={{ type: 'spring', stiffness: 70, damping: 12 }}
			animate={isActive ? 'active' : (navContext.isSearchActive ? 'hidden' : 'inactive')}
		>
			<Link
				href={props.href}
				className="px-2 py-1 gap-1 inline-flex flex-row items-center overflow-hidden"
				onClick={clickHandler}
			>
				{props.children}
				<motion.span
					variants={{
						active: {
							opacity: 1,
							maxWidth: 100
						},
						inactive: {
							opacity: 0,
							maxWidth: 0
						}
					}}
					transition={{ duration: 0.3 }}
					animate={isActive ? 'active' : 'inactive'}
				>
					{props.label}
				</motion.span>
			</Link>
		</motion.li>
	);
}

export function NavSearch() {
	const navContext = useNav();

	const focusHandler = useCallback(() => {
		navContext.setIsSearchActive(true);
	}, [navContext]);

	const blurHandler = useCallback(() => {
		navContext.setIsSearchActive(false)
	}, [navContext]);

	const { windowWidth } = useResize();

	return (
		<div className="relative items-center inline-flex text-foreground cursor-pointer ">
			<motion.button
				onClick={blurHandler}
				variants={{
					active: {
						translateX: 0,
						maxWidth: 32,
						marginRight: 8
					},
					inactive: {
						translateX: -32,
						maxWidth: 0,
						marginRight: 0
					}
				}}
				animate={navContext.isSearchActive ? 'active' : 'inactive'}
				className="overflow-hidden hover:bg-neutral-700 rounded-full cursor-pointer"
			>
				<ArrowLeftIcon className="size-8 text-inherit p-2" />
			</motion.button>
			<motion.input
				className={cn("w-full rounded-full h-full pl-8 border border-transparent focus-visible:border-foreground focus-visible:bg-neutral-600 placeholder:opacity-0 transition-opacity focus-visible:outline-0", {
					"bg-neutral-600 placeholder:opacity-100": navContext.isSearchActive
				})}
				whileFocus={{ width: 400 }}
				initial={{ width: 32 }}
				style={{
					width: 32,
					maxWidth: Math.min(
						windowWidth - (8 * 2) - (8 * 2) - (32 - 8) - 16,
						400
					)
				}}
				animate={{ width: navContext.isSearchActive ? 400 : 32 }}
				placeholder="Looking for..."
				onFocus={focusHandler}
				transition={{ type: 'spring', bounce: 0.1 }}
			/>
			<SearchIcon
				className={cn(
					"size-8 text-inherit absolute pointer-events-none p-2 left-10",
					{
						"left-0": !navContext.isSearchActive
					}
				)}
			/>
		</div>
	)
}

export function NavSearchPanel() {
	const navContext = useNav();
	const isMounted = useMounted();

	const { windowWidth, windowHeight } = useResize();

	if (!isMounted) return null;

	return createPortal(
		<motion.div
			className="bg-neutral-700/70 backdrop-blur-2xl text-foreground z-49 fixed left-1/2 -translate-x-1/2 overflow-hidden shadow-2xl w-full h-auto"
			initial={{ opacity: 0, maxHeight: 48 }}
			variants={{
				hidden: {
					opacity: 0,
					maxHeight: 48 + 10,
					padding: 0,
					maxWidth: 200,
					bottom: 16
				},
				peeking: {
					opacity: 1,
					maxHeight: windowHeight / 3,
					padding: 16,
					paddingTop: 8,
					paddingBottom: 48 + 4 + 8,
					maxWidth: Math.min(
						windowWidth - (8 * 2) - (8 * 2) - (32 - 8),
						400 + 16 + 32 + 8 + 8
					),
					bottom: 12
				},
			}}
			style={{
				borderRadius: (48 + 12) / 2
			}}
			animate={navContext.isSearchActive ? 'peeking' : 'hidden'}
			transition={{ type: 'spring', bounce: 0.1 }}
		>
			<span className="text-xs opacity-50">
				Start typing something...
			</span>
		</motion.div>
		, document.getElementById(navContext.portalId));
}