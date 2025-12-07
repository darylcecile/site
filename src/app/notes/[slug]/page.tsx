import NotesPageClient from '@/app/notes/[slug]/page.client';
import { ScrollHint } from '@/components/notes/ScrollHint';
import MarkdownRenderer from '@/components/utils/renderers/MarkdownRenderer';
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import type { Metadata, ResolvingMetadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from 'react';
import LocalDate from "../../../components/utils/LocalDate";
import { cacheLife } from 'next/cache';
import studio from '@/../studio';

type NotePageProps = {
	params: Promise<{
		slug: string;
	}>;
	searchParams?: Promise<Record<string, string>>;
};

export async function generateViewport({
	params,
	searchParams,
}: NotePageProps): Promise<Viewport[]> {
	return [{ minimumScale: 1, initialScale: 1, width: "device-width" }];
}

export async function generateMetadata(
	props: NotePageProps,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const params = await props.params;
	const postData = await studio.getCollection('notes').getEntry(params.slug);

	return {
		...((await parent) as any),
		metadataBase: new URL("https://darylcecile.net/"),
		alternates: {
			canonical: `https://darylcecile.net/notes/${postData?.slug}`,
			types: {
				"application/rss+xml": [
					{ title: "RSS Feed for darylcecile.net", url: "/rss.xml" },
				],
			},
		},
		title: postData.metadata.title,
		authors: { name: "Daryl Cecile", url: "https://darylcecile.net" },
		description: postData.metadata.snippet,
		openGraph: {
			title: postData.metadata.title,
			images: [`https://darylcecile.net/og?slug=${postData?.slug}`],
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title: postData.metadata.title,
			images: `https://darylcecile.net/og?slug=${postData?.slug}`,
			site: "@darylcecile",
			creator: "@darylcecile",
			description: postData.metadata.snippet,
		}
	} satisfies Metadata;
}

export default async function SingleNotePage(props: NotePageProps) {
	"use cache";

	cacheLife('minutes');

	const params = await props.params;
	const postData = await studio.getCollection('notes').getEntry(params.slug);
	if (!postData) return notFound();

	return (
		<article className="content px-8">
			<div className="max-w-2xl mx-auto w-full pt-20">
				<ViewTransition name={`notes-${postData.slug}`}>
					<h1 className="text-3xl text-balance">{postData.metadata.title}</h1>
					<p className="text-foreground/70 prose metalic-dark">
						<LocalDate dateString={postData.metadata.date} /> &middot;{" "}
						{postData.readTime}
					</p>
				</ViewTransition>
				{!!postData.metadata.lastUpdated && (
					<p className="text-foreground/70 prose">
						<strong>Last updated: </strong>
						<LocalDate dateString={postData.metadata.lastUpdated} />
					</p>
				)}
			</div>
			<br />
			<NotesPageClient>
				<div
					className={cn(
						"mx-auto wider-content content prose dark:prose-invert",
						"prose-a:hover:text-pink-400 prose-a:underline-offset-2 prose-img:rounded-lg",
						"prose-figcaption:text-center prose-h5:font-medium prose-h5:text-foreground",
						"prose-headings:inline-block prose-headings:mt-1 prose-headings:!mb-2"
					)}
				>
					<div className="max-w-2xl mx-auto w-full text-foreground/70">
						<MarkdownRenderer content={postData.content} />
					</div>
				</div>
			</NotesPageClient>
			{/* <div className={galleryStyles.workAroundTodoGalleryStyles} /> */}

			<ScrollHint />
		</article>
	);
}

export async function generateStaticParams() {
	const items = await studio.getCollection('notes').getEntries();
	
	items.sort((a, b) => {
		if ((a.metadata.lastUpdated ?? a.metadata.date) < (b.metadata.lastUpdated ?? b.metadata.date)) {
			return 1;
		}
		return -1;
	});

	const posts = items.filter(
		(note) => !note.metadata.hidden && dayjs(note.metadata.date).toDate().getTime() <= Date.now(),
	);

	return posts.map((post) => ({
		slug: post.slug,
	}));
}
