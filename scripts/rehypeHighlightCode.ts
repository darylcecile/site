import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';
import { getSingletonHighlighter, type Highlighter, type LanguageRegistration } from 'shiki';
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash';
import sakoaGrammar from '../src/lib/shiki/sakoa.tmLanguage.json';

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter() {
	highlighterPromise ??= (async () => {
		const highlighter = await getSingletonHighlighter({
			themes: ['github-dark'],
			langs: ['typescript', 'tsx', 'rust', 'html', 'bash', 'json'],
		});
		await highlighter.loadLanguage({ ...sakoaGrammar, name: 'sakoa' } as LanguageRegistration);
		return highlighter;
	})();
	return highlighterPromise;
}

// Keep the MDX component tree intact; only precompute the expensive code HTML.
export function rehypeHighlightCode() {
	return async (tree: Root) => {
		const highlighter = await getHighlighter();
		visit(tree, 'element', (node: Element) => {
			const code = node.children[0];
			if (node.tagName !== 'pre' || code?.type !== 'element' || code.tagName !== 'code') return;

			const rawCode = code.children.map(child => child.type === 'text' ? child.value : '').join('');
			const classes = code.properties.className;
			const languageClass = Array.isArray(classes)
				? classes.find(value => typeof value === 'string' && value.startsWith('language-'))
				: undefined;
			const language = typeof languageClass === 'string' ? languageClass.slice('language-'.length) : 'text';
			const lang = highlighter.getLoadedLanguages().includes(language) ? language : 'text';
			const withIntellisense = /(?:^|\s)twoslash(?:\s|$)/.test(code.data?.meta ?? '');

			node.properties.highlightedHtml = highlighter.codeToHtml(rawCode, {
				lang,
				theme: 'github-dark',
				transformers: [transformerTwoslash({
					renderer: rendererRich(),
					filter: language => ['typescript', 'ts', 'tsx'].includes(language) && withIntellisense,
				})],
			});
			node.properties.rawCode = rawCode;
		});
	};
}
