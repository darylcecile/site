"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { createContext, type Dispatch, type SetStateAction, use, useCallback, useRef, useState, type PropsWithChildren, useId, useEffect, useTransition } from "react";
import * as motion from "motion/react-client";
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftIcon, FolderGit2, FolderGit2Icon, Loader2, PenToolIcon, SearchIcon } from "lucide-react";
import { useResize } from "@/lib/hooks/useResize";
import { createPortal } from 'react-dom';
import { useMounted } from "@/lib/hooks/useMounted";
import { AnimatePresence } from "motion/react";
import { useDebounce } from '@/lib/hooks/useDebounce';
import { search } from '@/app/(actions)/search';

type NavContextType = {
	isSearchActive: boolean;
	setIsSearchActive: Dispatch<SetStateAction<boolean>>;
	portalId: string;
	isBackActive: boolean;
	setIsBackActive: Dispatch<SetStateAction<boolean>>;
	useBackButton: () => { show: () => void; hide: () => void };
	searchState: NavContextSearchState;
}

type NavContextSearchState = {
	searchTerm: string;
	setSearchTerm: Dispatch<SetStateAction<string>>;

	isPending: boolean;
	results?: Array<{
		type: 'note' | 'project';
		title: string;
		slug: string;
		content: string;
		keywords: string[];
	}>,
	error?: Error;
	state: 'idle' | 'pending' | 'success' | 'empty';
	selectionIndex: number;
	setSelectionIndex: Dispatch<SetStateAction<number>>;
}

const NavContext = createContext<NavContextType>(null);

export function NavProvider({ children }: PropsWithChildren) {
	const [isSearchActive, setIsSearchActive] = useState(false);
	const [isBackActive, setIsBackActive] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const portalId = useId();

	const [isSearchPending, startSearchTransition] = useTransition();
	const [results, setResults] = useState<NavContextSearchState['results']>(undefined);
	const [selectionIndex, setSelectionIndex] = useState(0);
	const text = useDebounce(searchTerm, 300);

	const useBackButton = useCallback(() => {
		useEffect(() => {
			setIsBackActive(true);
			return () => {
				setIsBackActive(false);
			}
		}, []);

		return {
			show: () => setIsBackActive(true),
			hide: () => setIsBackActive(false)
		}
	}, []);

	useEffect(() => {
		setResults(undefined);

		if (text.length > 0) {
			startSearchTransition(async () => {
				const result = await search(text);
				setResults(result);
				setSelectionIndex(0);
			});
		}
	}, [text]);

	return (
		<NavContext.Provider value={{
			isSearchActive,
			setIsSearchActive,
			portalId,
			isBackActive,
			setIsBackActive,
			useBackButton,
			searchState: {
				searchTerm,
				setSearchTerm,
				isPending: isSearchPending,
				results,
				error: undefined,
				state: isSearchPending ? 'pending' : (
					results ? (
						results.length ? 'success' : 'empty'
					) : 'idle'
				),
				selectionIndex,
				setSelectionIndex,
			}
		}}>
			{children}
		</NavContext.Provider>
	)
}

export function Nav(props: PropsWithChildren) {
	const { portalId, isBackActive, isSearchActive, setIsSearchActive, searchState } = useNav();

	const showBackButton = isBackActive && !isSearchActive;

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			const withinNav = (e.target as HTMLElement).closest('nav');
			const withinPortal = (e.target as HTMLElement).closest(`#${portalId}`);

			if (withinNav) return;
			// if (withinPortal) return;
			if (isSearchActive) {
				e.preventDefault();
				e.stopPropagation();
				setIsSearchActive(false);
				searchState.setSearchTerm('');
				searchState.setSelectionIndex(0);
			}
		};

		document.addEventListener('click', handleClick);
		return () => {
			document.removeEventListener('click', handleClick);
		}
	}, [isSearchActive, portalId, setIsSearchActive]);

	return (
		<>
			<motion.nav
				className={cn(
					"fixed left-1/2 -translate-x-1/2 p-2 rounded-full overflow-hidden shadow-2xl",
					"bg-neutral-100/70 dark:bg-muted/70 backdrop-blur-2xl backdrop-saturate-150 z-50"
				)}
				variants={{
					initial: { bottom: -100, scale: 0.5 },
					visible: { bottom: 16, scale: 1, translateX: 0 },
					withBack: { bottom: 16, scale: 1, translateX: 28 },
				}}
				initial={'initial'}
				animate={showBackButton ? 'withBack' : 'visible'}
				transition={{ type: 'spring' }}
			>
				<ul className="flex justify-between  gap-2">
					{props.children}
				</ul>
			</motion.nav>
			<div id={portalId} />
		</>
	);
}

export function useNav() {
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

	const blurSearch = useCallback(() => {
		navContext.setIsSearchActive(false);
	}, [navContext]);

	return (
		<motion.li
			ref={ref}
			onFocus={blurSearch}
			className={cn(
				"rounded-full min-w-8 max-h-8",
				`${isActive ? 'bg-background' : 'bg-transparent'} hover:bg-neutral-600`,
				"text-foreground hover:text-background dark:hover:text-foreground"
			)}
			style={{ maxWidth: 32 }}
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
				className={cn(
					`rounded-full py-1 ${isActive ? 'gap-1 px-3' : 'gap-0 px-1'} w-full justify-center inline-flex flex-row items-center overflow-hidden min-w-8 transition-all`,
					// "focus-visible:outline-amber-300 outline-1 outline-transparent",
					"focus-visible:outline-amber-300 outline-1 outline-transparent",
				)}
				onClick={clickHandler}
			>
				{props.children}
				<motion.span
					style={{ maxWidth: 0 }}
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
	const ref = useRef<HTMLInputElement>(null);
	const router = useRouter();

	const focusHandler = useCallback(() => {
		navContext.setIsSearchActive(true);
	}, [navContext]);

	const blurHandler = useCallback(() => {
		navContext.setIsSearchActive(false)
	}, [navContext]);

	const focusSearchHandler = useCallback(() => {
		if (navContext.isSearchActive) return;
		navContext.setIsSearchActive(true);
		ref.current?.focus();
	}, [navContext]);

	const { windowWidth } = useResize();

	return (
		<div className={cn("relative items-center inline-flex text-foreground", {
			// "hover:bg-neutral-600 text-foreground hover:text-background rounded-full": !navContext.isSearchActive
			"text-foreground hover:text-background dark:hover:text-foreground": !navContext.isSearchActive
		})}>
			<motion.button
				onClick={blurHandler}
				onFocus={focusSearchHandler}
				style={{ maxWidth: 0 }}
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
				className={cn(
					"overflow-hidden hover:bg-neutral-700 rounded-full cursor-pointer",
					'bg-transparent hover:bg-neutral-600',
					"text-foreground hover:text-background dark:hover:text-foreground",
					"focus-visible:outline-amber-300 outline-1 outline-transparent outline-offset-1"
				)}
			>
				<ArrowLeftIcon className="size-8 text-inherit p-2" />
			</motion.button>
			<motion.input
				ref={ref}
				className={cn("w-full rounded-full h-full pl-8 border border-transparent focus-visible:border-amber-300 placeholder:opacity-0 transition-opacity focus-visible:outline-0", {
					"bg-neutral-50 focus-visible:bg-neutral-100 dark:bg-neutral-700 placeholder:opacity-100": navContext.isSearchActive,
					'bg-transparent hover:bg-neutral-600 cursor-pointer': !navContext.isSearchActive,
					"text-foreground hover:text-background dark:hover:text-foreground": !navContext.isSearchActive
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
				value={navContext.searchState.searchTerm}
				onChange={e => {
					navContext.searchState.setSearchTerm(e.target.value);
				}}
				onKeyUp={e => {
					if (e.key === 'ArrowDown') {
						e.preventDefault();
						navContext.searchState.setSelectionIndex(prev => {
							if (prev + 1 >= navContext.searchState.results?.length) return prev;
							return prev + 1;
						});
					}

					if (e.key === 'ArrowUp') {
						e.preventDefault();
						navContext.searchState.setSelectionIndex(prev => {
							if (prev - 1 < 0) return prev;
							return prev - 1;
						});
					}

					if (e.key === 'Enter') {
						e.preventDefault();
						const result = navContext.searchState.results?.[navContext.searchState.selectionIndex];
						if (result) {
							navContext.searchState.setSearchTerm('');
							navContext.setIsSearchActive(false);
							(e.target as HTMLInputElement).blur();
							router.push(`/${result.type}s/${result.slug}`);
						}
					}
				}}
			/>
			<SearchIcon
				className={cn(
					"size-8 text-inherit absolute pointer-events-none p-2 left-10",
					{
						"left-0": !navContext.isSearchActive,
					}
				)}
			/>
		</div>
	)
}

export function NavSearchPanel() {
	const navContext = useNav();
	const isMounted = useMounted();
	const { state, results, selectionIndex, setSelectionIndex } = navContext.searchState;
	const { windowWidth, windowHeight } = useResize();
	const listRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		if (listRef.current) {
			listRef.current.querySelectorAll('li').item(selectionIndex)?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'nearest'
			});
		}
	}, [selectionIndex]);

	if (!isMounted) return null;

	return createPortal(
		<motion.div
			className="flex flex-col bg-neutral-300/10 dark:bg-neutral-700/70 backdrop-blur-2xl backdrop-saturate-150 text-foreground z-49 fixed left-1/2 -translate-x-1/2 overflow-hidden shadow-2xl w-full h-auto"
			initial={'initial'}
			variants={{
				initial: { opacity: 0, maxHeight: 48 },
				hidden: {
					opacity: 0,
					maxHeight: 48 + 10,
					padding: 0,
					maxWidth: 200,
					bottom: 16
				},
				peeking: {
					opacity: 1,
					maxHeight: windowHeight - 48 - 16,
					padding: 0,
					paddingBottom: 48 + 4,
					maxWidth: Math.min(
						windowWidth - (8 * 2) - (8 * 2) - (32 - 8),
						400 + 16 + 32 + 8 + 8
					),
					bottom: 12
				},
			}}
			style={{
				borderRadius: (48 + 8) / 2,
				maxWidth: 200,
			}}
			animate={navContext.isSearchActive ? 'peeking' : 'hidden'}
			transition={{ type: 'spring', bounce: 0.1 }}
		>

			{state === 'idle' && (
				<span
					key='idle-state'
					className="text-xs opacity-50 flex flex-row items-center gap-2 p-4"
				>
					Start typing something...
				</span>
			)}
			{state === 'pending' && (
				<span
					key='pending-state'
					className="text-xs opacity-50 flex flex-row items-center gap-2 p-4"
				>
					<Loader2 className="animate-spin size-4 text-inherit" />
					Searching...
				</span>
			)}
			{state === 'empty' && (
				<span
					key='empty-state'
					className="text-xs opacity-50 flex flex-row items-center gap-2 p-4"
				>
					No results found.
				</span>
			)}
			<AnimatePresence>
				{state === 'success' && (
					<motion.ul
						key='success-state'
						ref={listRef}
						className="grid grid-cols-1 gap-1 max-h-[calc(100vh-48px)] overflow-y-auto flex-1 p-1"
					>
						<AnimatePresence>
							{results.map((result, i) => {
								const Icon = result.type === 'project' ? FolderGit2Icon : PenToolIcon;
								return (
									<motion.li
										key={result.slug}
										className={cn(
											"text-xs opacity-50 hover:bg-muted rounded-lg p-2 hover:opacity-100 hover:text-foreground transition-all duration-300 ease-in-out",
											{ 'rounded-t-3xl': i === 0, 'rounded-b-3xl': i === results.length - 1 },
											{ 'text-neutral-900 bg-amber-300 opacity-100': selectionIndex === i },
										)}
										exit={{ opacity: 0, transform: 'translateY(-1em)' }}
									>
										<Link
											href={`/${result.type}s/${result.slug}`}
											className="pl-2 flex flex-row items-center gap-4 text-inherit"
											onMouseEnter={() => {
												setSelectionIndex(i);
											}}
										>
											<Icon size={'1.5em'} />
											<div className="flex flex-col">
												<span className="text-base">{result.title}</span>
												<span className="text-xs text-inherit/75 capitalize">{result.type}</span>
											</div>
										</Link>
									</motion.li>
								)
							})}
						</AnimatePresence>
					</motion.ul>
				)}
			</AnimatePresence>
		</motion.div>
		, document.getElementById(navContext.portalId));
}

export function NavBackButton() {
	const navContext = useNav();
	const router = useRouter();

	const clickHandler = useCallback(() => {
		navContext.setIsSearchActive(false);
		if (window.history.length > 1) {
      router.back();
  } else {
      const pathSegments = window.location.pathname.split('/');
      if (pathSegments.length > 1) {
          pathSegments.pop();
          const newPath = pathSegments.join('/') || '/';
          router.push(newPath);
      } else {
          router.push('/');
      }
  }
	}, [navContext, router]);

	const showBackButton = navContext.isBackActive && !navContext.isSearchActive;

	return (
		<motion.div
			className={cn(
				"fixed left-1/2 -translate-x-1/2 p-2 max-h-12 rounded-full overflow-hidden shadow-2xl",
				"bg-neutral-100/70 dark:bg-muted/70 backdrop-blur-2xl backdrop-saturate-150 z-50",
				"bottom-4"
			)}
			variants={{
				hidden: { opacity: 0, translateX: 0 },
				visible: { opacity: 1, translateX: -90 }
			}}
			initial={'hidden'}
			animate={showBackButton ? 'visible' : 'hidden'}
			transition={{ type: 'spring' }}
		>
			<button
				onClick={clickHandler}
				className={cn(
					'rounded-full gap-0 w-full justify-center inline-flex flex-row items-center overflow-hidden min-w-8 min-h-8 transition-all',
					// "focus-visible:outline-amber-300 outline-1 outline-transparent",
					"focus-visible:outline-amber-300 outline-1 outline-transparent",
					"bg-transparent hover:bg-neutral-600 p-1 cursor-pointer",
					"text-foreground hover:text-background dark:hover:text-foreground"
				)}
			>
				<ArrowLeftIcon className="size-4 text-inherit" />
			</button>
		</motion.div>

	)
}
