import { CopyButton } from '@/components/utils/CopyButton';
import './twoslash.css'

type CodeRendererProps = {
	html: string;
	rawCode: string;
}

export default function CodeRenderer({ html, rawCode }: CodeRendererProps) {
	return (
		<div className="relative group/code">
			<div
				dangerouslySetInnerHTML={{ __html: html }}
			/>

			{/* Copy Button */}
			<CopyButton
				className="opacity-0 group-hover/code:opacity-100 focus-within:opacity-100 transition-opacity absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-sm"
				text={rawCode.trim()}
			/>
		</div>
	)
}
