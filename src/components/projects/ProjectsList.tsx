import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans";
import { getAllProjectsDataSorted } from "@/lib/repo/projectsRepo";
import ProjectsListItem from "./ProjectsListItem";

type ProjectsListProps = {
	maxItems?: number;
}



"use cache";
import { cacheLife } from "next/cache";
import ms from "ms";


export function ProjectsList(props: ProjectsListProps) {
	cacheLife({ revalidate: ms("1d") / 1000 }); // 1 day in seconds (adjust to "1h" if projects change more often)
	const publicProjects = getAllProjectsDataSorted().slice(0, props.maxItems);

	return (
		<div className={cn(GeistSans.className, 'max-w-2xl w-full mx-auto gap-8 flex flex-col  mb-8')}>
			{publicProjects.map((project, i) => (
				<ProjectsListItem key={project.id} project={project} index={i} />
			))}
		</div>
	)
}