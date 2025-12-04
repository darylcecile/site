
import { codeToHtml } from 'shiki'
import {
	transformerTwoslash,
	rendererRich
} from '@shikijs/twoslash';
import { CopyButton } from '@/components/utils/CopyButton';
import './twoslash.css'
import { cacheLife, cacheTag } from 'next/cache';

type CodeRendererProps = {
	lang: string;
	children: string;
	withIntellisense?: boolean;
}

async function formatCode(rawCode: string, lang:string, withIntellisense?:boolean): Promise<string> {
	"use cache";

	cacheLife('seconds');

	return codeToHtml(rawCode, {
		lang: lang,
		theme: 'github-dark',
		transformers: [
			transformerTwoslash({
				renderer: rendererRich(),
				filter: (lang, code, options) => {
					return ["typescript", "ts", "tsx"].includes(lang) && withIntellisense
				}
			})
		]
	});
}


export default async function CodeRenderer(props: CodeRendererProps) {
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