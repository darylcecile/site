import { writeFileSync } from "node:fs";
import { Feed } from "feed";
import Fuse from "fuse.js";
import { getAllNotesDataSorted, type Note } from "@/lib/repo/notesRepo";
import { getAllProjectsDataSorted } from "@/lib/repo/projectsRepo";
import { SEARCH_KEYS, toSearchText, type SearchDoc, type SearchIndexBundle } from "@/lib/search/config";
import dayjs from "dayjs";
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react';
import { contentModules } from '@/generated/content/modules';
import InfoBox from '@/components/utils/InfoBox';
import { getIdeas } from '@/lib/repo/ideasRepo';

// parses using dayjs
function parseISO(dateString: string) {
	return dayjs(dateString).toDate();
}

export async function compileMarkdown(slug: string) {
	const { default: Content } = await contentModules.notes[slug]();
	return createElement(Content, {
		components: {
			'Abbr': "abbr",
			'TweetRenderer': "custom-element",
			'InfoBox': InfoBox,
			'img': "img",
			'a': "a",
			'p': "p",
			'Gallery': "div",
			'pre': ({ children }) => createElement('pre', null, children),
		}
	});
}

async function compileToHTML(slug: string) {
	const out = await renderToStaticMarkup(
		await compileMarkdown(slug)
	);

	return out
}

const notesList = getAllNotesDataSorted();
const latestNote = notesList[0];

const feed = new Feed({
	updated: latestNote ? parseISO(latestNote.lastUpdated ?? latestNote.date) : new Date(0),
	title: "Daryl Cecile",
	description: "My notes",
	id: "https://darylcecile.net",
	link: "https://darylcecile.net",
	language: "en",
	image: "https://darylcecile.net/og",
	favicon: "https://darylcecile.net/images/core/profile-256.ico",
	copyright: `Daryl Cecile © ${new Date().getFullYear()}`,
	generator: "mFeed",
	feedLinks: {
		json: "https://darylcecile.net/rss.json",
		atom: "https://darylcecile.net/atom.xml",
		xml: "https://darylcecile.net/rss.xml",
	},
	author: {
		name: "Daryl Cecile",
		email: "me@darylcecile.net",
		link: "https://darylcecile.net",
	},
});

const notes: { items: Array<Partial<Note>> } = { items: [] };

for (const note of notesList) {
	if (!note.hidden) {
		const content = await compileToHTML(note.slug);
		feed.addItem({
			title: note.title,
			id: note.slug,
			link: `https://darylcecile.net/notes/${note.slug}`,
			description: "",
			content: content.substring(0, 200) + '<br /> Read more at <a href="https://darylcecile.net/notes/' + note.slug + '">darylcecile.net</a>',
			image: `https://darylcecile.net/og?slug=${note.slug}`,
			author: [
				{
					name: "Daryl Cecile",
					email: "darylcecile@gmail.com",
					link: "https://darylcecile.net",
				},
			],
			date: parseISO(note.date),
		});
	}

	notes.items.push({
		title: note.title,
		slug: note.slug,
		link: `https://darylcecile.net/notes/${note.slug}`,
		date: note.date,
		readTime: note.readTime,
		image: note.image,
		lastUpdated: note.lastUpdated,
		hidden: !!note.hidden,
		author: [
			{
				name: "Daryl Cecile",
				email: "me@darylcecile.net",
				link: "https://darylcecile.net",
			},
		],
		preview_img: note.preview_img
	});
}

writeFileSync("./public/rss.xml", feed.rss2());
writeFileSync("./public/atom.xml", feed.atom1());
writeFileSync("./public/rss.json", feed.json1());
writeFileSync("./public/notes.json", JSON.stringify(notes));

// Search index. Building this here means the nav never has to re-read and
// re-render markdown per keystroke — it fetches a static file once and matches
// locally.
const searchDocs: SearchDoc[] = [
	...(await getIdeas()).map((idea): SearchDoc => ({
		type: "idea",
		slug: idea.slug,
		title: idea.metadata.title,
		keywords: idea.metadata.topics,
		body: toSearchText(`${idea.metadata.snippet} ${idea.content}`),
	})),
	...notesList
		.filter((note) => !note.hidden)
		.map((note): SearchDoc => ({
			type: "note",
			slug: note.slug,
			title: note.title ?? note.slug,
			keywords: [],
			body: toSearchText(note.content),
		})),
	...getAllProjectsDataSorted().map((project): SearchDoc => ({
		type: "project",
		slug: project.id,
		title: project.name ?? project.id,
		keywords: project.tokens ?? [],
		body: toSearchText(project.content),
	})),
];

const searchBundle: SearchIndexBundle = {
	docs: searchDocs,
	index: Fuse.createIndex(SEARCH_KEYS, searchDocs).toJSON(),
};

writeFileSync("./public/search-index.json", JSON.stringify(searchBundle));
