import fs, { existsSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { Mark } from "../markdown";
import { cacheLife, cacheTag } from "next/cache";

export type Project = {
	name: string;
	id: string;
	summary: string;
	content: string;
	startYear: number;
	endYear?: number;
	image?: string;
	link: string;
	sticky?: boolean;
	tokens: string[];
	repo?: string | string[];
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
			content: matterResult.content,
		};
	});
	return allProjectsData.sort((a, b) => {
		// Sticky projects first.
		if (!!a.sticky !== !!b.sticky) return a.sticky ? -1 : 1;

		// Ongoing projects (no endYear) before completed ones.
		const aOngoing = a.endYear == null;
		const bOngoing = b.endYear == null;
		if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;

		// More recently started projects first.
		if (a.startYear !== b.startYear) return b.startYear - a.startYear;

		// Tiebreak: more recently ended first.
		const ae = a.endYear ?? Number.POSITIVE_INFINITY;
		const be = b.endYear ?? Number.POSITIVE_INFINITY;
		return be - ae;
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
		content: project.content,
	} as Project;
});
