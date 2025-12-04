import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { parse } from 'node-html-parser';
import type { PropsWithChildren } from 'react';
import FancyLink from './FancyLink';
import { cacheLife, cacheTag } from 'next/cache';

type AbbrPreviewProps = PropsWithChildren<{
	title: string;
	image?: string;
	favicon?: string;
	link?: string;
	description?: string;
	hideFavicon?: boolean;
	faviconUrl?: string;
}>

const base = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000';

export async function AbbrPreview(props: AbbrPreviewProps) {
	const data = props.link && await getMetadata(props.link);

	if (!data && !props.title && !props.description) {
		return props.children
	}

	const title = data?.title || props.title;

	return (
		<HoverCard openDelay={100} closeDelay={200} >
			<HoverCardTrigger asChild>
				{props.link ? (
					<FancyLink
						href={props.link}
						className='decoration-dotted'
						hideFavicon={props.hideFavicon}
						faviconUrlOverride={props.faviconUrl}
					>{props.children}</FancyLink>
				) : (
					<span className={cn(
						'underline decoration-dotted underline-offset-4'
					)}>{props.children}</span>
				)}
			</HoverCardTrigger>
			<HoverCardContent
				className={cn(
					"w-80 overflow-hidden border-none shadow-lg rounded-2xl p-2 flex flex-col",
					"bg-muted/20 backdrop-blur-2xl backdrop-saturate-150",
				)}
				align="center"
			>
				{data?.image && (
					<img src={`/proxy?u=${btoa(data.image)}`} className='bg-muted aspect-video w-full object-cover rounded-lg mb-2' alt="" />
				)}
				{title && (
					<p className={'p-1 leading-5 pb-0 text-balance relative'}>{title}</p>
				)}
				<p className='p-1 text-sm text-muted-foreground'>{data?.description ?? props.description}</p>
			</HoverCardContent>
		</HoverCard>
	)
}

function toColor(text: string) {
	// convert the text to a nummber between 0 and 7
	const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const index = hash % 7;
	const colors = [
		"text-red-700 dark:text-red-400",
		"text-yellow-700 dark:text-yellow-400",
		"text-green-700 dark:text-green-400",
		"text-blue-700 dark:text-blue-400",
		"text-indigo-700 dark:text-indigo-400",
		"text-purple-700 dark:text-purple-400",
		"text-pink-700 dark:text-pink-400"
	];
	return colors[index];
}

const URL_IGNORE_LIST = [
	"https://projectfunction.io"
];

async function getMetadata(url: string) {
	"use cache";

	cacheTag(`abbr-preview-${url}`);
	cacheLife('days');

	if (URL_IGNORE_LIST.some((ignore) => url.startsWith(ignore))) {
		return null;
	}

	try {
		const qualifiedUrl = new URL(url, 'https://darylcecile.net');
		const response = await fetch(qualifiedUrl, { method: "GET" }).catch(e => {
			console.log("Error fetching URL:", url, e);
			throw e;
		});
		if (!response.ok) return null;

		const text = await response.text();
		const DOC = parse(text);

		return {
			title: DOC.querySelector("title")?.innerText,
			favicon: [...DOC.querySelectorAll("[rel=icon]")]
				.reverse()[0]
				?.getAttribute("href"),
			image: DOC.querySelector('[property="og:image"]')?.getAttribute(
				"content",
			),
			description: (
				DOC.querySelector("[name=description]") ??
				DOC.querySelector('[property="og:description"]')
			)?.getAttribute("content"),
		}
	}
	catch (error) {
		console.error("Error parsing HTML:", error);
		return null;
	}
}