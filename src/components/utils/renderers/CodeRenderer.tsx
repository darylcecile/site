
import { codeToHtml } from 'shiki'
import {
	transformerTwoslash,
	rendererRich
} from '@shikijs/twoslash';
import './twoslash.css'

type CodeRendererProps = {
	lang: string;
	children: string;
}

export default async function CodeRenderer(props: CodeRendererProps) {
	const out = await codeToHtml(props.children, {
		lang: props.lang,
		theme: 'github-dark',
		transformers: [
			transformerTwoslash({
				renderer: rendererRich(),
				filter(lang, code, options) {
					return lang === 'ts' || lang === 'tsx';
				},
			})
		],
	});

	// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
	return <div dangerouslySetInnerHTML={{ __html: out }} />
}