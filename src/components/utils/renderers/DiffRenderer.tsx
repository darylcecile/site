import { FileCode2 } from 'lucide-react';
import { parseUnifiedDiff, type DiffRow, type FileDiff } from '@/lib/unifiedDiff';
import { cn } from '@/lib/utils';

const rowStyles = {
	added: 'bg-[#22863a]/15 text-[#85e89d]',
	removed: 'bg-[#b31d28]/15 text-[#fdaeb7]',
	context: 'text-[#e1e4e8]',
};

function DiffLine({ row }: { row: DiffRow }) {
	if (row.kind === 'hunk' || row.kind === 'meta') {
		return <div className="border-y border-white/10 bg-white/5 px-4 py-2 font-mono text-[11px] text-[#9da5b4] whitespace-pre-wrap break-all">{row.text || '\u00a0'}</div>;
	}
	const sign = row.kind === 'added' ? '+' : row.kind === 'removed' ? '−' : ' ';
	return (
		<div className={cn('grid grid-cols-[2.25rem_2.25rem_1.5rem_minmax(0,1fr)] font-mono text-[0.8rem] leading-[1.8]', rowStyles[row.kind])}>
			<span aria-hidden="true" className="select-none border-r border-white/10 px-1 py-1 text-right text-[#9da5b4]">{row.before}</span>
			<span aria-hidden="true" className="select-none border-r border-white/10 px-1 py-1 text-right text-[#9da5b4]">{row.after}</span>
			<span aria-hidden="true" className="select-none py-1 text-center">{sign}</span>
			<code className="block py-1 pr-4 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
				{row.kind !== 'context' && <span className="sr-only">{row.kind === 'added' ? 'Added: ' : 'Removed: '}</span>}
				{row.text || '\u00a0'}
			</code>
		</div>
	);
}

function FileChanges({ file }: { file: FileDiff }) {
	const name = file.after === '/dev/null' ? file.before : file.after ?? file.before ?? 'Changes';
	const added = file.rows.filter(row => row.kind === 'added').length;
	const removed = file.rows.filter(row => row.kind === 'removed').length;
	const renamed = file.before && file.after && file.before !== file.after && file.before !== '/dev/null' && file.after !== '/dev/null';
	return (
		<figure className="not-prose overflow-hidden rounded-[0.375rem] bg-[#24292e] text-[#e1e4e8]">
			<figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
				<span className="flex min-w-0 items-center gap-2 text-xs font-medium">
					<FileCode2 size={15} className="shrink-0 text-[#9da5b4]" aria-hidden="true" />
					<span className="break-all">{renamed ? `${file.before} → ${name}` : name}</span>
				</span>
				<span className="flex gap-3 font-mono text-xs">
					<span className="sr-only">Added lines: {added}. Removed lines: {removed}.</span>
					<span className="text-[#85e89d]" aria-hidden="true">+{added}</span>
					<span className="text-[#fdaeb7]" aria-hidden="true">−{removed}</span>
				</span>
			</figcaption>
			<div role="group" aria-label={`Changes in ${name}`}>
				{file.rows.map((row, index) => <DiffLine key={index} row={row} />)}
			</div>
		</figure>
	);
}

export default function DiffRenderer({ children }: { children: string }) {
	const files = parseUnifiedDiff(children);
	return <div className="not-prose my-7 space-y-4" data-diff-viewer="true">{files.map((file, index) => <FileChanges key={index} file={file} />)}</div>;
}
