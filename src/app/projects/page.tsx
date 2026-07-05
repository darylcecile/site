import { ProjectsList } from '@/components/projects/ProjectsList';
import { getAllProjectsDataSorted } from '@/lib/repo/projectsRepo';

export default async function ProjectsPage() {
	const projects = await getAllProjectsDataSorted();
	const years = projects.flatMap((project) => [
		project.startYear,
		project.endYear ?? project.startYear,
	]);
	const earliest = Math.min(...years);
	const latest = Math.max(...years);

	return (
		<div className='px-8 flex flex-col gap-12 pt-20'>
			<div className='max-w-2xl mx-auto w-full flex flex-col gap-2'>
				<h1 className='text-3xl'>Projects</h1>
				<p className='text-sm text-muted-foreground'>
					{projects.length} things I&apos;ve built between {earliest} and {latest} — products, libraries, and experiments.
				</p>
			</div>

			<ProjectsList />
		</div>
	)
}