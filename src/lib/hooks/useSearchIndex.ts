"use client";

import Fuse from "fuse.js";
import { useCallback, useRef, useState } from "react";
import {
	SEARCH_INDEX_URL,
	SEARCH_OPTIONS,
	type SearchDoc,
	type SearchIndexBundle,
} from "@/lib/search/config";

export type SearchResult = Pick<SearchDoc, "type" | "slug" | "title">;

function toResults(fuse: Fuse<SearchDoc>, query: string): SearchResult[] {
	return fuse.search(query).map(({ item }) => ({
		type: item.type,
		slug: item.slug,
		title: item.title,
	}));
}

/**
 * Loads the prebuilt search index once, on demand, and matches against it in
 * the browser. The index is a static asset, so it is fetched at most once per
 * session and served from the browser cache thereafter.
 */
export function useSearchIndex() {
	const fuseRef = useRef<Fuse<SearchDoc> | null>(null);
	const loaderRef = useRef<Promise<Fuse<SearchDoc> | null> | null>(null);
	const [isReady, setIsReady] = useState(false);

	const preload = useCallback(() => {
		if (fuseRef.current) return Promise.resolve(fuseRef.current);
		if (loaderRef.current) return loaderRef.current;

		loaderRef.current = fetch(SEARCH_INDEX_URL)
			.then((response) => {
				if (!response.ok) throw new Error(`Search index responded ${response.status}`);
				return response.json() as Promise<SearchIndexBundle>;
			})
			.then((bundle) => {
				const fuse = new Fuse(bundle.docs, SEARCH_OPTIONS, Fuse.parseIndex(bundle.index));
				fuseRef.current = fuse;
				setIsReady(true);
				return fuse;
			})
			.catch((error) => {
				// Clear the cached promise so a later attempt can retry.
				loaderRef.current = null;
				console.error("Failed to load search index", error);
				return null;
			});

		return loaderRef.current;
	}, []);

	/**
	 * Synchronous match. Returns `null` when the index has not loaded yet, which
	 * lets callers skip an async round trip — and the loading flash it would
	 * cause — for every keystroke after the first.
	 */
	const searchSync = useCallback((query: string): SearchResult[] | null => {
		const trimmed = query.trim();
		if (!trimmed) return [];
		if (!fuseRef.current) return null;

		return toResults(fuseRef.current, trimmed);
	}, []);

	const search = useCallback(
		async (query: string): Promise<SearchResult[]> => {
			const trimmed = query.trim();
			if (!trimmed) return [];

			const fuse = fuseRef.current ?? (await preload());
			if (!fuse) return [];

			return toResults(fuse, trimmed);
		},
		[preload],
	);

	return { search, searchSync, preload, isReady };
}
