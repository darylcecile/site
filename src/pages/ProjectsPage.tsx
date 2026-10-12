import { ProjectsList } from '@/components/projects/ProjectsList';
import type { ProjectCardData } from '@/components/projects/ProjectCard';

export default function ProjectsPage({ projects }: { projects: ProjectCardData[] }) {
	const years = projects.flatMap((project) => [
		project.startYear,
		project.endYear ?? project.startYear,
	]);
	const earliest = years.length ? Math.min(...years) : new Date().getFullYear();
	const latest = years.length ? Math.max(...years) : earliest;

	return (
		<div className='px-8 flex flex-col gap-12 pt-20'>
			<div className='max-w-2xl mx-auto w-full flex flex-col gap-2'>
				<h1 className='text-3xl'>Projects</h1>
				<p className='text-sm text-muted-foreground'>
					{projects.length} things I&apos;ve built between {earliest} and {latest} — products, libraries, and experiments.
				</p>
			</div>

			<ProjectsList projects={projects} />
		</div>
	)
}
