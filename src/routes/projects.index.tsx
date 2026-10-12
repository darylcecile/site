import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getAggregatedRepoStats } from '@/lib/repo/githubRepo';
import type { ProjectCardData } from '@/components/projects/ProjectCard';
import ProjectsPage from '@/pages/ProjectsPage';

const getProjectsData = createServerFn({ method: 'GET' }).handler(async () => {
	const { getProjectCards } = await import('@/lib/repo/projectsRepo');
	return Promise.all(getProjectCards().map(async (project): Promise<ProjectCardData> => {
		const stats = project.repo ? await getAggregatedRepoStats(project.repo) : null;
		return {
			id: project.id,
			name: project.name,
			summary: project.summary,
			startYear: project.startYear,
			endYear: project.endYear,
			image: project.image,
			tokens: project.tokens,
			sticky: project.sticky,
			stats: stats ? { commitsCount: stats.commitsCount, lastUpdated: stats.lastUpdated, repoCount: stats.repos.length } : null,
		};
	}));
});

export const Route = createFileRoute('/projects/')({
	loader: () => getProjectsData(),
	head: () => ({ links: [{ rel: 'canonical', href: 'https://darylcecile.net/projects' }] }),
	component: ProjectsRoute,
});

function ProjectsRoute() {
	return <ProjectsPage projects={Route.useLoaderData()} />;
}
