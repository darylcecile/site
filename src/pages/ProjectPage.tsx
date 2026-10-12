import type { ProjectPageData } from '@/lib/repo/projectsRepo';
import type { AggregatedRepoStats } from '@/lib/repo/githubRepo';
import MarkdownRenderer from '@/components/utils/renderers/MarkdownRenderer';
import { cn } from "@/lib/utils";
import { ViewTransition } from 'react';
import Link from '@/components/utils/Link';
import ProjectsPageClient from '@/components/projects/ProjectInteractions';
import { MFPostContent, MFPostTitle } from "@/components/microformats/blog";

type ProjectPageProps = {
	project: ProjectPageData;
	repoStats: AggregatedRepoStats | null;
};

export default function ProjectPage({ project, repoStats }: ProjectPageProps) {
	const projectImage = project.image;
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
			timeZone: "UTC",
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
					<MarkdownRenderer collection="projects" slug={project.id} />
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
									<span className="text-foreground/85 font-medium">{repoStats.commitsCount.toLocaleString('en-US')}</span>{" "}
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

				{project.link && <div className='max-w-2xl mx-auto w-full mb-10 flex items-center justify-end'>
					<p className='text-sm pt-4'>
						Curious? <Link className='text-foreground/50 hover:underline underline-offset-2' href={project.link}>Get the Details</Link> ↗
					</p>
				</div>}
			</div>
			{/* <div className={galleryStyles.workAroundTodoGalleryStyles} /> */}
			<ProjectsPageClient />
		</article>
	);
}
