import type { Metadata, ResolvingMetadata, Viewport } from "next";
import { notFound } from "next/navigation";
import LocalDate from "../../../components/utils/LocalDate";
import { getAllNotesDataSorted, getNoteData } from "@/lib/repo/notesRepo";
import MarkdownRenderer from '@/components/utils/renderers/MarkdownRenderer';
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { unstable_ViewTransition as ViewTransition } from 'react';
import NotesPageClient from '@/app/notes/[slug]/page.client';

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
	const postData = await getNoteData(params.slug, true);

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
		title: postData?.title,
		authors: { name: "Daryl Cecile", url: "https://darylcecile.net" },
		description: postData?.snippet,
		openGraph: {
			title: postData?.title,
			images: [`https://darylcecile.net/og?slug=${postData?.slug}`],
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title: postData?.title,
			images: `https://darylcecile.net/og?slug=${postData?.slug}`,
			site: "@darylcecile",
			creator: "@darylcecile",
		},
		icons: {
			apple: {
				sizes: "180x180",
				url: "/images/core/profile_180.png",
			},
			icon: [
				{
					url: "/images/core/profile_32.png",
					sizes: "32x32",
					type: "image/png",
				},
				{
					url: "/images/core/profile_16.png",
					sizes: "16x16",
					type: "image/png",
				},
			],
			shortcut: ["/images/core/profile.ico"],
			other: [
				{ rel: "me", url: "https://twitter.com/darylcecile" },
				{
					rel: "webmention",
					url: "https://webmention.io/darylcecile.net/webmention",
				},
				{
					rel: "pingback",
					url: "https://webmention.io/darylcecile.net/xmlrpc",
				},
			],
		},
		manifest: "/site.webmanifest",
	} satisfies Metadata;
}

export default async function SingleNotePage(props: NotePageProps) {
	const params = await props.params;
	const postData = await getNoteData(params.slug);
	if (!postData) return notFound();

	return (
		<article className="content px-8">
			<div className="max-w-2xl mx-auto w-full pt-20">
				<ViewTransition name={`notes-${postData.slug}`}>
					<h1 className="text-3xl">{postData.title}</h1>
					<p className="text-foreground/70 prose">
						<LocalDate dateString={postData.date} /> &middot;{" "}
						{postData.readTime}
					</p>
				</ViewTransition>
				{!!postData.lastUpdated && (
					<p className="text-foreground/70 prose">
						{"Last updated: "}
						<LocalDate dateString={postData.lastUpdated} />
					</p>
				)}
			</div>
			<br />
			<div
				className={cn(
					"mx-auto wider-content content prose dark:prose-invert",
					"prose-a:hover:text-pink-400 prose-a:underline-offset-2 prose-img:rounded-lg",
					"prose-figcaption:text-center prose-h5:font-medium prose-h5:text-foreground"
				)}
			>
				<div className="max-w-2xl mx-auto w-full text-foreground/70">
					<MarkdownRenderer content={postData.content} />
				</div>
			</div>
			{/* <div className={galleryStyles.workAroundTodoGalleryStyles} /> */}
			<NotesPageClient />
		</article>
	);
}

export async function generateStaticParams() {
	const posts = getAllNotesDataSorted(true).filter(
		(note) => !note.hidden && dayjs(note.date).toDate().getTime() <= Date.now(),
	);

	return posts.map((post) => ({
		slug: post.slug,
	}));
}
