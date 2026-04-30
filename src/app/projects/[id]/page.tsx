import type { Metadata, ResolvingMetadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getAllProjectsDataSorted, getProjectData } from "@/lib/repo/projectsRepo";
import { getAggregatedRepoStats } from "@/lib/repo/githubRepo";
import MarkdownRenderer from '@/components/utils/renderers/MarkdownRenderer';
import { cn } from "@/lib/utils";
import { ViewTransition } from 'react';
import Link from 'next/link';
import ProjectsPageClient from '@/app/projects/[id]/page.client';
import { MFPostContent, MFPostTitle } from "@/components/microformats/blog";

type ProjectPageProps = {
	params: Promise<{
		id: string;
	}>;
	searchParams?: Promise<Record<string, string>>;
};

export async function generateViewport({
	params,
	searchParams,
}: ProjectPageProps): Promise<Viewport[]> {
	return [{ minimumScale: 1, initialScale: 1, width: "device-width" }];
}

export async function generateMetadata(
	props: ProjectPageProps,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const params = await props.params;
	const postData = await getProjectData(params.id);

	const image = !postData.image ? undefined : (
		URL.canParse(postData.image) ? postData.image : `/images/projects/${postData.image}`
	)

	return {
		...((await parent) as any),
		metadataBase: new URL("https://darylcecile.net/"),
		alternates: {
			canonical: `https://darylcecile.net/projects/${postData?.id}`,
			types: {
				"application/rss+xml": [
					{ title: "RSS Feed for darylcecile.net", url: "/rss.xml" },
				],
			},
		},
		title: postData?.name,
		authors: { name: "Daryl Cecile", url: "https://darylcecile.net" },
		description: postData?.summary,
		openGraph: {
			title: postData?.name,
			images: [image],
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			title: postData?.name,
			images: image,
			site: "@darylcecile",
			creator: "@darylcecile",
			description: postData?.summary,
		},
	} satisfies Metadata;
}

export default async function SingleProjectPage(props: ProjectPageProps) {
	const params = await props.params;
	const project = await getProjectData(params.id);
	if (!project) return notFound();

	const projectImage = !project.image ? undefined : (
		URL.canParse(project.image) ? project.image : `/images/projects/${project.image}`
	);

	const repoStats = project.repo ? await getAggregatedRepoStats(project.repo) : null;
	const singleRepo = repoStats && repoStats.repos.length === 1 ? repoStats.repos[0] : null;
	const repoLabel = singleRepo
		? singleRepo.repo
		: repoStats
			? `${repoStats.repos.length} repos`
			: null;
	const repoHref = singleRepo?.htmlUrl ?? null;
	const lastUpdatedLabel = repoStats?.lastUpdated
		? new Date(repoStats.lastUpdated).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
		: null;

	return (
		<article className="content px-8">
			<div className="max-w-2xl mx-auto w-full pt-20">
				<ViewTransition name={`projects-${project.id}`}>
					<MFPostTitle className="text-3xl">{project.name}</MFPostTitle>
					<p className="text-foreground/85 prose metalic-dark">{project.startYear} - {project.endYear ?? 'Ongoing'}</p>
				</ViewTransition>
			</div>
			<br />
			<div
				className={cn(
					"mx-auto wider-content content prose dark:prose-invert tracking-wide",
					"prose-a:hover:text-pink-400 prose-a:underline-offset-2 prose-img:rounded-lg",
					"prose-figcaption:text-center prose-h5:font-medium prose-h5:text-foreground"
				)}
			>
				{projectImage && (
					<ViewTransition name={`projects-image-${project.id}`}>
						<img
							src={projectImage}
							alt={''}
							className="max-w-2xl mx-auto w-full z-2 aspect-auto object-cover rounded-sm" />
					</ViewTransition>
				)}

				<MFPostContent className="max-w-2xl mx-auto w-full text-foreground/85">
					<MarkdownRenderer content={project.summary} />
				</MFPostContent>

				{repoStats && (
					<div className="max-w-2xl mx-auto w-full mt-8 not-prose">
						<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/70 border-t border-foreground/10 pt-4">
							{repoHref ? (
								<Link
									href={repoHref}
									className="hover:text-foreground hover:underline underline-offset-2"
								>
									{repoLabel} ↗
								</Link>
							) : (
								<span className="text-foreground/85">{repoLabel}</span>
							)}
							{repoStats.commitsCount != null && (
								<span>
									<span className="text-foreground/85 font-medium">{repoStats.commitsCount.toLocaleString()}</span>{" "}
									commit{repoStats.commitsCount === 1 ? "" : "s"}
								</span>
							)}
							{lastUpdatedLabel && (
								<span>
									Last updated <span className="text-foreground/85">{lastUpdatedLabel}</span>
								</span>
							)}
						</div>
					</div>
				)}

				<div className='max-w-2xl mx-auto w-full mb-10 flex items-center justify-end'>
					<p className='text-sm pt-4'>
						Curious? <Link className='text-foreground/50 hover:underline underline-offset-2' href={project.link}>Get the Details</Link> ↗
					</p>
				</div>
			</div>
			{/* <div className={galleryStyles.workAroundTodoGalleryStyles} /> */}
			<ProjectsPageClient />
		</article>
	);
}

export async function generateStaticParams() {
	const projects = await getAllProjectsDataSorted();

	return projects.map((post) => ({
		id: post.id,
	}));
}
