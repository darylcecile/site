import { parse } from "node-html-parser";
import { cachedJson } from "./cache.server";
import type { LinkMetadata } from "./preview-types";
import { validateMetadataUrl } from "./preview-validation";

function ignoredUrl(url: string): boolean {
	return new URL(url).hostname === "projectfunction.io";
}

async function fetchPage(url: string): Promise<Response> {
	const signal = AbortSignal.timeout(5000);
	for (let redirects = 0; redirects <= 3; redirects++) {
		if (ignoredUrl(url)) throw new Error("Preview fetching is disabled for this website.");
		const response = await fetch(url, { signal, redirect: "manual" });
		if (response.status < 300 || response.status >= 400) return response;
		await response.body?.cancel();
		const location = response.headers.get("location");
		if (!location) throw new Error("Preview redirect has no destination.");
		url = validateMetadataUrl(new URL(location, url).href);
	}
	throw new Error("Too many preview redirects.");
}

async function readHtml(response: Response): Promise<string> {
	const reader = response.body?.getReader();
	if (!reader) throw new Error("Preview response has no body.");
	const decoder = new TextDecoder();
	let html = "";
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) return html + decoder.decode();
			size += value.byteLength;
			if (size > 2 * 1024 * 1024) {
				await reader.cancel();
				throw new Error("Preview response is too large.");
			}
			html += decoder.decode(value, { stream: true });
		}
	} finally {
		reader.releaseLock();
	}
}

function assetUrl(value: string | undefined, base: string): string | undefined {
	if (!value) return undefined;
	try {
		const url = new URL(value, base);
		return /^https?:$/.test(url.protocol) ? url.href : undefined;
	} catch {
		return undefined;
	}
}

export async function loadLinkMetadata(url: string): Promise<LinkMetadata | null> {
	if (ignoredUrl(url)) return null;
	try {
		return await cachedJson(`link-metadata:${url}`, 3 * 86400, async () => {
			const response = await fetchPage(url);
			if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
				await response.body?.cancel();
				throw new Error("Preview request did not return HTML.");
			}
			const document = parse(await readHtml(response));
			const base = response.url || url;
			return {
				title: document.querySelector("title")?.innerText,
				favicon: assetUrl(document.querySelectorAll('[rel~="icon"]').at(-1)?.getAttribute("href"), base),
				image: assetUrl(document.querySelector('[property="og:image"]')?.getAttribute("content"), base),
				description: (document.querySelector('[name="description"]') ?? document.querySelector('[property="og:description"]'))?.getAttribute("content"),
			};
		});
	} catch {
		console.warn("[Link preview] Could not load website metadata.");
		return null;
	}
}
