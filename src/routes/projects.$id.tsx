import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getAggregatedRepoStats } from '@/lib/repo/githubRepo';
import ProjectPage from '@/pages/ProjectPage';

const getProjectData = createServerFn({ method: 'GET' })
	.validator((id: string) => {
		if (typeof id !== 'string' || !id) throw notFound();
		return id;
	})
	.handler(async ({ data: id }) => {
		const { getProjectPage } = await import('@/lib/repo/projectsRepo');
		const project = getProjectPage(id);
		if (!project) throw notFound();
		const repoStats = project.repo ? await getAggregatedRepoStats(project.repo) : null;
		return { project, repoStats };
	});

export const Route = createFileRoute('/projects/$id')({
	loader: ({ params }) => getProjectData({ data: params.id }),
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const { project } = loaderData;
		const image = project.image ? new URL(project.image, 'https://darylcecile.net').href : 'https://darylcecile.net/og';
		return {
			meta: [
				{ title: project.name },
				{ name: 'description', content: project.summary },
				{ property: 'og:title', content: project.name },
				{ property: 'og:image', content: image },
				{ name: 'twitter:title', content: project.name },
				{ name: 'twitter:description', content: project.summary },
				{ name: 'twitter:image', content: image },
			],
			links: [{ rel: 'canonical', href: `https://darylcecile.net/projects/${project.id}` }],
		};
	},
	component: ProjectRoute,
});

function ProjectRoute() {
	return <ProjectPage {...Route.useLoaderData()} />;
}
