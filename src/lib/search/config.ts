import type { FuseIndex, FuseOptionKey, IFuseOptions } from "fuse.js";

export type SearchDoc = {
	type: "note" | "project" | "idea";
	slug: string;
	title: string;
	keywords: string[];
	body: string;
};

export type SearchIndexBundle = {
	docs: SearchDoc[];
	index: ReturnType<FuseIndex<SearchDoc>['toJSON']>;
};

export const SEARCH_INDEX_URL = "/search-index.json";

export const SEARCH_KEYS: Array<FuseOptionKey<SearchDoc>> = [
	{ name: "title", weight: 3 },
	{ name: "keywords", weight: 2 },
	{ name: "body", weight: 1 },
];

// `ignoreLocation` is the important one: Fuse defaults to `location: 0` /
// `distance: 100`, which scores matches by how close they are to the start of a
// field. Against multi-thousand-character bodies that makes anything past the
// first sentence unreachable.
//
// The threshold was tuned against this corpus: 0.18 keeps precision at 1.00 with
// full recall while still absorbing typos ("typescrpt", "reactt"). Precision
// falls off a cliff at 0.20 (0.56), so only raise it with fresh measurements.
export const SEARCH_OPTIONS: IFuseOptions<SearchDoc> = {
	keys: SEARCH_KEYS,
	ignoreLocation: true,
	threshold: 0.18,
	includeScore: true,
};

/**
 * Reduces markdown to plain prose for indexing. Fenced code blocks are dropped —
 * they are bulky and mostly punctuation. Inline code is unwrapped rather than
 * dropped, because short spans like `--target wasm` carry the technical
 * vocabulary people actually search for.
 */
export function toSearchText(markdown: string): string {
	if (!markdown) return "";

	return markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/~~~[\s\S]*?~~~/g, " ")
		.replace(/`([^`]*)`/g, "$1")
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s{0,3}>\s?/gm, "")
		.replace(/[*_~|]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}
