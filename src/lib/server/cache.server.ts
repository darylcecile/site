import { env } from "cloudflare:workers";

let warnedAboutMissingCache = false;

export async function cachedJson<T>(
	key: string,
	ttlSeconds: number,
	load: () => Promise<T>,
	shouldCache: (value: T) => boolean = () => true,
): Promise<T> {
	const cache = (env as { SITE_CACHE?: KVNamespace }).SITE_CACHE;
	if (!cache) {
		if (!warnedAboutMissingCache) {
			console.warn("[Site cache] SITE_CACHE is unavailable; fetching directly.");
			warnedAboutMissingCache = true;
		}
		return load();
	}

	// URLs can exceed KV's key limit. Hash keys rather than storing full URLs.
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
	const cacheKey = `site:v1:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")}`;
	try {
		const cached = await cache.get<T>(cacheKey, "json");
		if (cached !== null && shouldCache(cached)) return cached;
	} catch {
		console.warn("[Site cache] Read failed; fetching directly.");
	}

	// Missing or incomplete upstream data stays uncached so later requests retry.
	const value = await load();
	if (value !== null && value !== undefined && shouldCache(value)) {
		try {
			await cache.put(cacheKey, JSON.stringify(value), { expirationTtl: ttlSeconds });
		} catch {
			console.warn("[Site cache] Write failed; returning fresh data.");
		}
	}
	return value;
}
