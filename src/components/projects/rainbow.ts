// The site's signature accent system: a rainbow keyed by list index (`i % 7`).
// Mirrors the palette used by NotesListItem and the bookmarks list so the projects
// page speaks the same visual language as the rest of the site.
export const rainbowColors = [
	{ text: "text-red-500", bg: "focus-within:bg-red-500/10", var: "--color-red-500" },
	{ text: "text-yellow-600", bg: "focus-within:bg-yellow-500/10", var: "--color-yellow-500" },
	{ text: "text-green-500", bg: "focus-within:bg-green-500/10", var: "--color-green-500" },
	{ text: "text-blue-500", bg: "focus-within:bg-blue-500/10", var: "--color-blue-500" },
	{ text: "text-indigo-500", bg: "focus-within:bg-indigo-500/10", var: "--color-indigo-500" },
	{ text: "text-purple-500", bg: "focus-within:bg-purple-500/10", var: "--color-purple-500" },
	{ text: "text-pink-500", bg: "focus-within:bg-pink-500/10", var: "--color-pink-500" },
] as const;

export type RainbowColor = (typeof rainbowColors)[number];

/** Stable rainbow colour for a given list index. */
export function rainbowAt(index: number): RainbowColor {
	return rainbowColors[((index % rainbowColors.length) + rainbowColors.length) % rainbowColors.length];
}
