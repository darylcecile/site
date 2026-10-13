import { ImageResponse } from '@vercel/og';
import { env } from 'cloudflare:workers';
import { Buffer } from 'node:buffer';
import noteData from "@/../public/notes.json";
import { cn } from "@/lib/utils";
import dayjs from 'dayjs';
import customParse from 'dayjs/plugin/customParseFormat';
import advanceFormat from 'dayjs/plugin/advancedFormat';
import { productForHostname } from './product-sites';
import { generateProductOgImage } from './product-og.server';

dayjs.extend(customParse);
dayjs.extend(advanceFormat);


export async function generateOgResponse(request: Request): Promise<Response> {
	try {
		const image = await generateOgImage(request);
		if (!image.ok) return image;
		const bytes = await image.arrayBuffer();
		if (!bytes.byteLength) throw new Error('Social image renderer returned an empty image.');
		return new Response(bytes, {
			headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
		});
	} catch (error) {
		console.error('[og] Rendering failed', error instanceof Error ? error.message : error);
		return new Response('Social image unavailable', { status: 502 });
	}
}

export async function generateOgImage(opt: Request): Promise<Response> {
	const url = new URL(opt.url);
	const product = productForHostname(url.hostname);
	if (product) return generateProductOgImage(product);
	const { searchParams } = url;
	const icon = await env.ASSETS.fetch(new URL('/icon.png', opt.url));
	if (!icon.ok) return new Response('Profile image unavailable', { status: 502 });
	const avatar = `data:image/png;base64,${Buffer.from(await icon.arrayBuffer()).toString('base64')}`;

	if (!searchParams.has("slug")) {
		if (searchParams.has("page")) {
			const pageImage = (
				<SimpleImage
					avatar={avatar}
					title={`/${searchParams.get("page")?.toLowerCase()}`}
					subHeading={"@darylcecile"}
					theme={searchParams.has("dark") ? "dark" : "light"}
				/>
			);

			console.info('Sending Page Image');

			return new ImageResponse(pageImage,
				{
					fonts: [
						{
							name: 'Geist Sans',
							data: await loadGoogleFont('Geist', "@darylcecile" + searchParams.get("page")?.toLowerCase() + "/"),
							style: 'normal',
						}
					]
				}
			);
		}

		const defaultImage = (
			<SimpleImage
				avatar={avatar}
				title={"Hey! I'm Daryl 👋🏾"}
				subHeading={"@darylcecile"}
				theme={searchParams.has("dark") ? "dark" : "light"}
			/>
		);

		console.info('Sending Default Image');

		return new ImageResponse(defaultImage,
			{
				fonts: [
					{
						name: 'Geist Sans',
						data: await loadGoogleFont('Geist', "Hey! I'm Daryl @darylcecile"),
						style: 'normal',
					}
				]
			}
		);
	}

	const post = noteData.items.find(
		(item) => item.slug === searchParams.get("slug"),
	);

	if (!post || post.hidden) return new Response('Note not found', { status: 404 });

	const postImage = (
		<AdvanceImage
			avatar={avatar}
			title={post.title}
			authorName={post.author[0].name}
			readTime={post.readTime}
			theme={searchParams.has("dark") ? "dark" : "light"}
			previewImg={post.preview_img}
		/>
	);

	console.info('Sending Post Image for:', post.title);

	return new ImageResponse(postImage,
		{
			fonts: [
				{
					name: 'Geist Sans',
					data: await loadGoogleFont('Geist', post.title + post.author[0].name + post.readTime + "DarylCecile" + "minutes"),
					style: 'normal',
				}
			]
		}
	);
}

async function loadGoogleFont(font: string, letters: string) {
	const text = Array.from(new Set(letters.split(''))).join('');
	const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`
	const stylesheet = await fetch(url, { signal: AbortSignal.timeout(10_000) });
	if (!stylesheet.ok) throw new Error(`Font stylesheet request failed (${stylesheet.status})`);
	const css = await stylesheet.text();
	const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

	if (resource) {
		const response = await fetch(resource[1], { signal: AbortSignal.timeout(10_000) })
		if (response.status == 200) {
			return await response.arrayBuffer()
		}
	}

	throw new Error('failed to load font data')
}


function SimpleImage({ title, theme, subHeading, avatar }) {
	const bg = theme === 'dark' ? 'black' : 'white';
	return (
		<div
			style={{
				background: `radial-gradient(circle at 50% -20%, ${bg} 0%, ${bg} 50%, ${theme === 'dark' ? '#022f2e' : '#cbfbf1'} 100%)`,
			}}
			tw="w-full h-full flex flex-col justify-center items-center p-16"
		>
			<img
				src={avatar}
				alt=""
				style={{
					width: 128,
					height: 128,
				}}
			/>
			<span
				style={{
					fontSize: 26,
					marginTop: 24,
					padding: 5,
					marginBottom: 32,
				}}
				tw={theme === 'dark' ? "text-purple-200/80" : "text-purple-900/80"}
			>
				{subHeading}
			</span>
			<p
				style={{
					fontSize: 74,
					maxWidth: "100%",
					lineHeight: 1.2,
					whiteSpace: "nowrap",
					textAlign: "center",
				}}
				tw={theme === 'dark' ? "text-teal-100" : "text-teal-900"}
			>
				{title}
			</p>


			<div
				tw={cn("absolute -bottom-6 left-0 right-0 h-12")}
				style={{
					// rainbow gradient
					backgroundImage:
						"linear-gradient(to right, indigo, violet, red, orange, yellow, green, deepskyblue)",
					filter: "blur(20px)",
					fontFamily: "'Geist Sans', sans-serif",
				}}
			/>
		</div>
	);
}

function AdvanceImage({ title, authorName, theme, previewImg, readTime, avatar }) {
	const bg = theme === 'dark' ? 'black' : 'white';
	return (
		<div
			tw={"w-full h-full flex flex-col justify-center p-16"}
			style={{
				background: `linear-gradient(to bottom right, ${bg} 0%, ${bg} 50%, ${theme === 'dark' ? '#022f2e' : '#cbfbf1'} 100%)`,
				fontFamily: "'Geist Sans', sans-serif",
			}}
		>
			<p
				tw={theme === 'dark' ? "text-teal-100" : "text-teal-900"}
				style={{
					fontSize: 74,
					maxWidth: "70%",
					lineHeight: 1.05,
				}}
			>
				{title}
			</p>
			<span
				tw={theme === 'dark' ? "text-orange-200/80" : "text-orange-900/80"}
				style={{
					fontSize: 26,
					marginTop: 16,
					padding: 5,
				}}
			>
				{authorName}&emsp;&mdash;&emsp;{readTime}
			</span>

			<div tw="mt-auto flex flex-row items-center">
				<img
					src={avatar}
					alt=""
					style={{
						height: 75,
						width: 75,
						aspectRatio: "1/1",
					}}
					tw=" rounded-full"
				/>

				<div tw={cn("flex flex-col ml-2", theme === 'dark' ? 'text-purple-300/80' : 'text-purple-900/80')}>
					<p tw="m-0 text-xl font-bold">Daryl Cecile</p>
					<p tw="m-0 opacity-60">darylcecile.net/notes</p>
				</div>
			</div>


			{previewImg && (
				<img
					src={previewImg}
					alt=""
					style={{
						height: 630 - 64,
						width: 400,
						position: "absolute",
						objectFit: "contain",
						right: 32,
						top: 32,
						bottom: 32
					}}
				/>
			)}

			<div
				tw={cn("absolute -bottom-6 left-0 right-0 h-12")}
				style={{
					// rainbow gradient
					backgroundImage:
						"linear-gradient(to right, indigo, violet, red, orange, yellow, green, deepskyblue)",
					filter: "blur(20px)",
					fontFamily: "'Geist Sans', sans-serif",
				}}
			/>
		</div>
	);
}
