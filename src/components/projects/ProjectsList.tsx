import { ProjectsExplorer } from './ProjectsExplorer';
import type { ProjectCardData } from './ProjectCard';

export function ProjectsList({ projects }: { projects: ProjectCardData[] }) {
	return <ProjectsExplorer projects={projects} />;
}
