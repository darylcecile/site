"use client";

import useMediaQuery from '@/lib/hooks/useMediaQuery';
import { cn } from "@/lib/utils";
import { type WritableAtom, atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { type SetStateAction, useEffect, useRef, useState } from "react";

type Heading = Record<string, string>;

export const headingsCollectionAtom = atom<Heading>({});
export const activeHeadingIndexAtom = atom(-1);
export const hintHoveredAtom = atom(false);

export function useScrollHintHeading(id: string, text: string) {
	const [headings, setHeadings] = useAtom(headingsCollectionAtom);
	const [activeHeadingIndex, setActiveHeadingIndex] = useAtom(activeHeadingIndexAtom);

	const keys = Object.keys(headings);

	// register the heading
	useEffect(() => {
		// add to the collection
		setHeadings((prev) => {
			return {
				...prev,
				[id]: text,
			}
		});

		// remove from the collection
		return () => {
			setHeadings((prev) =>
				Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id))
			);
		}
	}, [id, text, setHeadings]);

	// update active heading on scroll
	useEffect(() => {
		if (Object.keys(headings).length < 2) return;

		const el = document.getElementById(id);

		if (!el) return;

		const onScroll = () => {
			// when the heading goes past the top of the viewport, set it as the active heading
			const rect = el.getBoundingClientRect();
			const index = rect.top < (window.innerHeight / 3) ? keys.indexOf(id) : -1;
			if (index === -1) return;
			debouncer(activeHeadingIndexAtom, () => {
				setActiveHeadingIndex(index);
			}, 10);
		}

		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, [keys, id, setActiveHeadingIndex, headings]);

	return activeHeadingIndex >= keys.indexOf(id);
}

export function useScrollHints() {
	const headings = useAtomValue(headingsCollectionAtom);
	const index = useAtomValue(activeHeadingIndexAtom);

	return {
		headings,
		index,
	}
}

export function useScrollHintHovered() {
	return useAtomValue(hintHoveredAtom);
}

const timers = new WeakMap<WritableAtom<unknown, [SetStateAction<unknown>], void>, ReturnType<typeof setTimeout>>();
function debouncer<Value>(
	atom: WritableAtom<Value, [SetStateAction<Value>], void>,
	fn: () => void,
	delay: number
) {
	if (timers.has(atom)) {
		clearTimeout(timers.get(atom));
	}
	timers.set(atom, setTimeout(() => fn(), delay));
}

export function ScrollHint() {
	const { headings, index } = useScrollHints();
	const setHovered = useSetAtom(hintHoveredAtom);
	const keys = Object.keys(headings);

	if (keys.length < 2) return null;

	return (
		<div className="fixed top-1/2 -translate-y-1/2 left-4 min-w-12 min-h-2 grid grid-cols-1 group">
			{keys.map((key, i) => {
				const isActive = index === i;
				return (
					<button
						key={key}
						className={cn(
							// "group-item",
							"inline-block text-transparent text-[2px] whitespace-nowrap mr-auto rounded-full overflow-clip",
							"transition-all duration-300 ease-out",
							"group-hover:-translate-x-1 group-hover:text-xs p-0.5 bg-background"
						)}
						onClick={() => {
							const el = document.getElementById(key);
							if (!el) return;
							el.scrollIntoView({
								behavior: "smooth",
								block: "start",
							});
							setHovered(false);
						}}
						onMouseOver={() => setHovered(true)}
						onMouseLeave={() => setHovered(false)}
						onFocus={() => setHovered(true)}
						onBlur={() => setHovered(false)}
						aria-label={headings[key]}
						aria-current={isActive ? "true" : "false"}
						aria-hidden={isActive ? "false" : "true"}
					>
						<span
							className={cn(
								'bg-neutral-300 dark:bg-neutral-700',
								'text-transparent',
								'group-hover:text-foreground group-hover:bg-background group-hover:p-2',
								'transition-all duration-300 ease-out',
								'hover:text-purple-500',
								{
									"bg-black dark:bg-white": isActive,
									"font-bold": isActive,
								}
							)}
						>
							{headings[key]}
						</span>
					</button>
				)
			})}
		</div>
	)
}