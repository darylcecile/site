import fs, { existsSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { Mark } from "../markdown";
import { cacheLife, cacheTag } from "next/cache";

export type Project = {
	name: string;
	id: string;
	summary: string;
	startYear: number;
	endYear?: number;
	image?: string;
	link: string;
	sticky?: boolean;
	tokens: string[];
};

const projectsDirectory = path.join(process.cwd(), "src/projects_markdown");

export const getAllProjectsDataSorted = cache(async () => {
	"use cache";

	cacheTag("projects-data");
	cacheLife('minutes');

	// Get file names under /notes
	const fileNames = fs.readdirSync(projectsDirectory);
	const allProjectsData: Project[] = fileNames.filter(fileName => {
		if (!fileName.endsWith(".md") && !fileName.endsWith('.mdx')) return false;
		return true;
	}).map((fileName) => {
		// Remove ".md" from file name to get id
		const id = fileName.replace(/\.(?:md|mdx)$/, "");

		// Read markdown file as string
		const fullPath = path.join(projectsDirectory, fileName);
		const fileContents = fs.readFileSync(fullPath, "utf8");
		const markdownParser = new Mark();

		// Use gray-matter to parse the post metadata section
		const matterResult: Partial<Project & { renderedContent: string }> =
			markdownParser.parse(fileContents);

		// Combine the data with the id
		return <Project>{
			id,
			...matterResult,
			summary: matterResult.renderedContent,
		};
	});
	// Sort notes by date
	return allProjectsData
		.sort((a, b) => {
			// if (!a.endYear || !b.endYear) return 0;
			const ae = a.endYear ?? new Date().getUTCFullYear();
			const be = b.endYear ?? new Date().getUTCFullYear();
			if (ae < be) {
				return 1;
			}
			return -1;
		})
		.sort((a, b) => {
			// sort by start year
			if (a.endYear) return 0;
			if (a.startYear < b.startYear) return 1;
			return -1;
		})
		.sort((a, b) => {
			if (a.sticky && !b.sticky) return -1;
			if (!a.sticky && b.sticky) return 1;
			return 0;
		});
});

export const getAllProjectIds = cache(() => {
	const fileNames = fs.readdirSync(projectsDirectory);
	return fileNames.filter(fileName => {
		if (!fileName.endsWith(".md") && !fileName.endsWith('.mdx')) return false;
		return true;
	}).map((fileName) => {
		return {
			params: {
				id: fileName.replace(/\.md$/, ""),
			},
		};
	});
});

export const getProjectData = cache((id: string) => {
	const fullPath = path.join(projectsDirectory, `${id}.md`);

	if (!existsSync(fullPath)) return null;

	const fileContents = fs.readFileSync(fullPath, "utf8");
	const markdownParser = new Mark();

	const project = markdownParser.parse(fileContents) as any;

	return {
		id,
		...project,
		summary: project.renderedContent,
	} as Project;
});
