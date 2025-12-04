import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans";
import { getAllProjectsDataSorted } from "@/lib/repo/projectsRepo";
import ProjectsListItem from "./ProjectsListItem";

type ProjectsListProps = {
	maxItems?: number;
}

export async function ProjectsList(props: ProjectsListProps) {
	const results = await getAllProjectsDataSorted();
	const publicProjects = results.slice(0, props.maxItems);

	return (
		<div className={cn(GeistSans.className, 'max-w-2xl w-full mx-auto gap-8 flex flex-col  mb-8')}>
			{publicProjects.map((project, i) => (
				<ProjectsListItem key={project.id} project={project} index={i} />
			))}
		</div>
	)
}