
import { getSingletonHighlighter, type Highlighter } from 'shiki'
import {
	transformerTwoslash,
	rendererRich
} from '@shikijs/twoslash';
import { CopyButton } from '@/components/utils/CopyButton';
import './twoslash.css'
import { cacheLife } from 'next/cache';
import { Suspense } from 'react';
import sakoaGrammar from '@/lib/shiki/sakoa.tmLanguage.json';

type CodeRendererProps = {
	lang: string;
	children: string;
	withIntellisense?: boolean;
}

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = (async () => {
			const hl = await getSingletonHighlighter({
				themes: ['github-dark'],
				langs: ['typescript', 'tsx', 'rust', 'html', 'bash', 'json'],
			});
			await hl.loadLanguage({
				...(sakoaGrammar as any),
				name: 'sakoa',
			});
			return hl;
		})();
	}
	return highlighterPromise;
}

async function formatCode(rawCode: string, lang:string, withIntellisense?:boolean): Promise<string> {
	"use cache";

	cacheLife('seconds');

	const hl = await getHighlighter();
	const loaded = hl.getLoadedLanguages();
	const resolvedLang = loaded.includes(lang) ? lang : 'text';

	return hl.codeToHtml(rawCode, {
		lang: resolvedLang,
		theme: 'github-dark',
		transformers: [
			transformerTwoslash({
				renderer: rendererRich(),
				filter: (lang, code, options) => {
					return ["typescript", "ts", "tsx"].includes(lang) && !!withIntellisense
				}
			})
		]
	});
}


function CodeFallback({ rawCode }: { rawCode: string }) {
	return (
		<div className="relative group/code">
			<pre className="shiki" style={{ backgroundColor: '#24292e' }}>
				<code>{rawCode}</code>
			</pre>
		</div>
	);
}

export default function CodeRenderer(props: CodeRendererProps) {
	const rawCode = props.children;
	return (
		<Suspense fallback={<CodeFallback rawCode={rawCode} />}>
			<CodeRendererInner {...props} />
		</Suspense>
	);
}

async function CodeRendererInner(props: CodeRendererProps) {
	const rawCode = props.children;
	const out = await formatCode(rawCode, props.lang, props.withIntellisense);

	return (
		<div className="relative group/code">
			<div
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
				dangerouslySetInnerHTML={{ __html: out }}
			/>

			{/* Copy Button */}
			<CopyButton
				className="opacity-0 group-hover/code:opacity-100 focus-within:opacity-100 transition-opacity absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-sm"
				text={rawCode.trim()}
			/>
		</div>
	)
}