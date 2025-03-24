import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { parse } from 'node-html-parser';
import type { PropsWithChildren } from 'react';

type AbbrPreviewProps = PropsWithChildren<{
	title: string;
	image?: string;
	favicon?: string;
	link?: string;
	description: string;
}>

const base = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` || 'http://localhost:3000';

export async function AbbrPreview(props: AbbrPreviewProps) {
	const data = props.link && await getMetadata(props.link);
	const origin = props.link && new URL(props.link, base).host;

	if (!data && !props.title) {
		return props.children
	}

	return (
		<HoverCard>
			<HoverCardTrigger href={props.link} className={cn(
				'relative',
				{ 'pl-5': !!origin }
			)}>
				{!!origin && (
					<img
						src={`https://icons.duckduckgo.com/ip3/${origin}.ico`}
						alt=""
						className="w-4 h-4 my-0 rounded inline not-prose absolute left-0 top-0.5"
					/>
				)}
				<span className={cn(
					'underline decoration-dotted underline-offset-4'
				)}>{props.children}</span>
			</HoverCardTrigger>
			<HoverCardContent
				className="w-80 overflow-hidden border-none shadow-lg rounded-2xl bg-muted p-2 flex flex-col"
				align="center"
			>
				{data?.image && (
					<img src={`/proxy?u=${btoa(data.image)}`} className='aspect-video w-full object-cover rounded-lg mb-2' alt="" />
				)}
				<p className={'p-1 leading-5 pb-0 text-balance relative'}>{data?.title ?? props.title}</p>
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

async function getMetadata(url: string) {
	try {
		const response = await fetch(url, { method: "GET" });
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