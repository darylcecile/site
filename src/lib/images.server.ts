import { env } from 'cloudflare:workers';

export async function transformImage(request: Request, source: string, width: number, quality = 80) {
	const origin = new URL(request.url);
	let url: URL;
	try {
		url = new URL(source, origin);
	} catch {
		return new Response('Invalid image URL', { status: 400 });
	}
	if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
		return new Response('Invalid image URL', { status: 400 });
	}

	let upstream: Response;
	try {
		upstream = url.origin === origin.origin
			? await env.ASSETS.fetch(url)
			: await fetch(url, { signal: AbortSignal.timeout(10_000) });
	} catch (error) {
		console.warn('[images] Upstream fetch failed', error instanceof Error ? error.message : error);
		return new Response('Image unavailable', { status: 502 });
	}
	if (!upstream.ok || !upstream.body) return new Response('Image not found', { status: 404 });
	if (!upstream.headers.get('Content-Type')?.startsWith('image/')) {
		return new Response('Unsupported image type', { status: 415 });
	}

	const original = upstream.clone();
	try {
		const image = await env.IMAGES.input(upstream.body)
			.transform({ width, fit: 'scale-down' })
			.output({ format: 'image/webp', quality });
		const response = image.response();
		response.headers.set('Cache-Control', 'public, max-age=86400');
		return response;
	} catch (error) {
		console.warn('[images] Transformation failed', error instanceof Error ? error.message : error);
		return new Response(original.body, {
			headers: {
				'Content-Type': original.headers.get('Content-Type')!,
				'Cache-Control': 'public, max-age=3600',
			},
		});
	}
}
