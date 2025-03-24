import { notFound } from "next/navigation";
import sharp from "sharp";


export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const incomingUrl = searchParams.get("url") || Buffer.from(searchParams.get('u'), 'base64').toString('utf-8');

	if (!incomingUrl) return notFound();

	const url = decodeURIComponent(incomingUrl);

	const res = await fetch(url, { method: "GET" });

	if (!res.ok) {
		console.error("Failed to fetch image:", res.status, res.statusText);
		return notFound();
	}

	try {
		const imgBuffer = await res.arrayBuffer();
		const image = await sharp(Buffer.from(imgBuffer)).resize({
			width: 600,
			withoutEnlargement: true,
			fit: 'inside',
		}).toBuffer();

		return new Response(image, {
			headers: new Headers({
				"Content-Type": "image/png", // Set the appropriate content type
				"Cache-Control": "s-maxage=86400",
			}),
		});
	}
	catch (error) {
		console.error("Error processing image:", error);
	}

	if (!res.body) return notFound();

	const response = new Response(res.body, {
		headers: new Headers({
			"Cache-Control": "s-maxage=86400",
		}),
	});

	return response;
}