import type MarkdownIt from "markdown-it";

export class Mark {
	private ymlFront = require("yaml-front-matter");
	private mdLib = require("markdown-it");
	private md: MarkdownIt;
	private plugins = {
		emoji: require("markdown-it-emoji").full,
		abbreviation: require("markdown-it-abbr"),
		modToken: require("markdown-it-modify-token"),
		checkbox: require("markdown-it-task-checkbox"),
	};

	constructor() {

		this.md = this.mdLib({
			html: true, // Enable HTML tags in source
			xhtmlOut: true, // Use '/' to close single tags (<br />).
			breaks: true, // Convert '\n' in paragraphs into <br>
			langPrefix: "lang-", // CSS language prefix for fenced blocks. Useful for external highlighters.
			linkify: true, // Auto-convert URL-like text to links

			// Enable some language-neutral replacement + quotes beautification
			typographer: true,
			quotes: "“”‘’",

			// Highlighter function. Should return escaped HTML,
			// or '' if the source string is not changed and should be escaped externally.
			// If result starts with <pre... internal wrapper is skipped.
			highlight: (/*str, lang*/) => "",

			modifyToken: (token, env) => {
				switch (token.type) {
					case "image":
						token.attrObj.loading = "lazy";
						break;
					case "link_open":
						token.attrObj.target = "_blank";
						token.attrObj.rel = "noopener";
						token.attrObj.class = "l";
						token.attrObj.hreflang = "en";
						break;
					case "bullet_list_open":
						token.attrObj.class = "para";
						break;
					default:
						//console.log(token);
						break;
				}
			},
		});
		this.md.use(this.plugins.emoji);
		this.md.use(this.plugins.abbreviation);
		this.md.use(this.plugins.checkbox, {
			disabled: true,
			divWrap: false,
			divClass: "md-checkbox",
			ulClass: "md-task-list",
			liClass: "md-task-list-item",
		});
		this.md.use(this.plugins.modToken);
	}

	transform(input: string) {
		let output = this.md.render(input);

		output = output.replace(
			/<p>[ \n]*?(<img ([a-zA-Z0-9-]+?=[a-zA-Z0-9."'_/?#&= ]+?)+>)[ \n]*?<\/p>/gm,
			(_: string, sub1: string) => sub1,
		);

		return output;
	}

	parse(input: string): {
		[name: string]: any;
		content: string;
		renderedContent: string;
	} {
		const result = this.ymlFront.safeLoadFront(input, {
			contentKeyName: "content",
		});

		let readTime;
		const words = result.content.split(" ");
		const time = Math.round(words.length / 200);
		if (time <= 1) {
			readTime = "1 minute read";
		} else readTime = `${time} minutes`;

		return {
			...result,
			renderedContent: this.transform(result.content),
			readTime,
		};
	}
}
