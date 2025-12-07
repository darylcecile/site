import { defineStudioConfig, Collection } from "@shrubs/studio";
import { GitHubAdapter } from "@shrubs/studio/adapters/github";
import { z } from "zod/v4";

export default defineStudioConfig({
	remote: new GitHubAdapter({
		token: process.env.GITHUB_TOKEN,
		repo: "darylcecile/site",
		branch: "testing",
	}),
	collections: [
		Collection.define({
			name: "notes",
			path: "./src/notes_markdown",
			schema: {
				metadata: z.object({
					title: z.string().min(1),
					date: z.iso.date(),
					snippet: z.string(),
					image: z.string().optional(), // deprecated
					preview_img: z.string().optional(),
					lastUpdated: z.iso.date().optional(),
					hidden: z.boolean().optional(),
				})
			}
		}),
		Collection.define({
			name: "projects",
			path: "./src/projects_markdown",
			schema: {
				metadata: z.object({
					name: z.string().min(1),
					image: z.string().optional(),
					startYear: z.number().min(1900),
					endYear: z.number().min(1900).optional(),
					link: z.url().optional(),
					tokens: z.array(z.string()).optional(),
					sticky: z.boolean().optional(),
				})
			},
			assetsPath: "./public/projects/"
		})
	]
});


