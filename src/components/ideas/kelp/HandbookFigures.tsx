import { ArrowDown, ArrowRight, BookOpen, FileText, Laptop, Server } from 'lucide-react';
import type { ReactNode } from 'react';

function Diagram({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
	return (
		<figure aria-label={title} className="not-prose my-10 overflow-hidden rounded-2xl border border-border bg-background/80">
			<div className="p-5 sm:p-6">
				<p className="mb-5 text-sm font-medium">{title}</p>
				{children}
			</div>
			<figcaption className="border-t border-border bg-muted/25 px-5 py-4 text-xs leading-6 text-muted-foreground sm:px-6">{caption}</figcaption>
		</figure>
	);
}

const pageColors = {
	retry: 'border-l-blue-500',
	install: 'border-l-purple-500',
	incident: 'border-l-pink-500',
};

function Page({ name, detail, color, badge }: { name: string; detail?: string; color: keyof typeof pageColors; badge?: string }) {
	return (
		<div className={`rounded-md border border-border border-l-[3px] bg-background p-3 ${pageColors[color]}`}>
			<div className="flex items-start gap-2">
				<FileText size={14} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
				<span className="text-xs font-medium">{name}</span>
			</div>
			{detail && <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>}
			{badge && <span className="mt-2 inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{badge}</span>}
		</div>
	);
}

export function HandbookEditions() {
	return (
		<Diagram title="A new edition can reuse unchanged pages" caption="Each commit identifies a complete recorded edition. Only the retry page needs different contents here; both editions refer to the same stored installation and incident pages.">
			<div className="grid gap-4 sm:grid-cols-2">
				{[false, true].map(updated => <div key={String(updated)} className="rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
					<p className="mb-3 flex items-center gap-2 text-sm font-medium"><BookOpen size={16} aria-hidden="true" />{updated ? 'Edition after the edit' : 'Original edition'}</p>
					<div className="grid gap-2">
						<Page name="Retry guidance" detail={updated ? 'Retry only transient failures.' : 'Retry failed requests.'} color="retry" badge={updated ? 'Changed contents' : 'Original contents'} />
						<Page name="Installation" color="install" badge={updated ? 'Reused contents' : 'Original contents'} />
						<Page name="Incident response" color="incident" badge={updated ? 'Reused contents' : 'Original contents'} />
					</div>
				</div>)}
			</div>
		</Diagram>
	);
}

function Fork({ join = false }: { join?: boolean }) {
	return (
		<svg viewBox="0 0 480 44" preserveAspectRatio="none" className="h-10 w-full text-muted-foreground/45" aria-hidden="true">
			<path d={join ? 'M120 0 V12 Q120 24 132 24 H228 Q240 24 240 36 V44 M360 0 V12 Q360 24 348 24 H252 Q240 24 240 36' : 'M240 0 V8 Q240 20 228 20 H132 Q120 20 120 32 V44 M240 8 Q240 20 252 20 H348 Q360 20 360 32 V44'} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
		</svg>
	);
}

export function HandbookBranches() {
	return (
		<Diagram title="Two lines of work, one shared starting point" caption="A branch is a bookmark into a line of recorded editions. This shows a Git merge: the combined edition records both earlier lines as parents, preserving their original commits.">
			<div className="mx-auto w-fit rounded-lg border border-border bg-muted/30 px-5 py-3 text-center text-sm">Shared starting edition</div>
			<Fork />
			<div className="grid grid-cols-2 gap-3">
				<div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-center"><span className="font-mono text-[11px] text-blue-700 dark:text-blue-300">retry-guidance</span><p className="mt-2 text-xs">An edition with the retry edit</p></div>
				<div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 text-center"><span className="font-mono text-[11px] text-purple-700 dark:text-purple-300">installation-docs</span><p className="mt-2 text-xs">An edition with the installation edit</p></div>
			</div>
			<Fork join />
			<div className="mx-auto max-w-xs rounded-lg border border-border bg-muted/30 p-4 text-center"><p className="text-sm font-medium">Combined edition</p><p className="mt-1 text-xs text-muted-foreground">Both edits, with both histories retained</p></div>
		</Diagram>
	);
}

export function SelectedPages() {
	return (
		<Diagram title="One selected page. The rest of the handbook stays intact." caption="Illustrated selection: operations/retries.md. Kelp downloads the selected file contents and required transaction history. The muted pages remain on the remote; their absence from the checkout is not a deletion.">
			<div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
				<div className="rounded-xl border border-border bg-muted/20 p-4">
					<p className="mb-3 flex items-center gap-2 text-sm font-medium"><BookOpen size={16} aria-hidden="true" /> Shared handbook</p>
					<div className="space-y-2">
						<Page name="Retry guidance" color="retry" badge="Selected" />
						<div className="grayscale"><Page name="Installation" color="install" badge="Stays remote" /></div>
						<div className="grayscale"><Page name="Incident response" color="incident" badge="Stays remote" /></div>
					</div>
				</div>
				<ArrowRight className="mx-auto hidden text-muted-foreground sm:block" size={20} aria-hidden="true" />
				<ArrowDown className="mx-auto text-muted-foreground sm:hidden" size={20} aria-hidden="true" />
				<div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
					<p className="mb-3 flex items-center gap-2 text-sm font-medium"><Laptop size={16} aria-hidden="true" /> Your checkout</p>
					<Page name="Retry guidance" color="retry" badge="Available to edit" />
					<p className="mt-3 rounded-md border border-dashed border-border p-3 text-xs leading-5 text-muted-foreground">Required commit records are retained whole, even when a record also describes a page you haven’t downloaded.</p>
				</div>
			</div>
		</Diagram>
	);
}

export function PinnedEdition() {
	return (
		<Diagram title="A release fixes the combination of work" caption="A single commit may describe only one page. A release view identifies the included work and all its dependencies, producing exact committed files. The tag is a name for that view, not proof of approval or passing tests.">
			<div className="grid gap-2 sm:grid-cols-2">
				<Page name="Retry-guidance edit" color="retry" detail="Based on its earlier retry page" />
				<Page name="Installation edit" color="install" detail="Based on its earlier installation page" />
			</div>
			<div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground"><ArrowDown size={16} aria-hidden="true" /> Include the required earlier work</div>
			<div className="rounded-xl border border-border bg-muted/25 p-4">
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-2 text-sm font-medium"><BookOpen size={16} aria-hidden="true" /> Exact committed edition</span><span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-1 font-mono text-xs text-purple-700 dark:text-purple-300">v1.0</span></div>
				<div className="grid gap-2 sm:grid-cols-3"><Page name="Updated retry page" color="retry" /><Page name="Updated installation" color="install" /><Page name="Unchanged incidents" color="incident" /></div>
			</div>
		</Diagram>
	);
}

export function DistributedArchive() {
	return (
		<Diagram title="One project, several storage nodes" caption="Example placement of three file objects, with two copies of each. Transactions, journal entries, and release pins are replicated too. Real placement is hash-based; the diagram is not a benchmark or a directory-to-server mapping.">
			<div className="grid grid-cols-2 gap-3 text-center text-sm"><div className="rounded-lg border border-border bg-muted/20 p-3">Developers & agents</div><div className="rounded-lg border border-border bg-muted/20 p-3">Build workers</div></div>
			<div className="flex justify-center py-3"><ArrowDown size={18} className="text-muted-foreground" aria-hidden="true" /></div>
			<div className="grid grid-cols-2 gap-3"><div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3 text-center text-sm">Gateway A</div><div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 text-center text-sm">Gateway B</div></div>
			<p className="py-3 text-center text-xs text-muted-foreground">Validate dependencies and route records</p>
			<div className="grid gap-3 sm:grid-cols-3">
				{[
					{ name: 'Storage A', pages: ['retry', 'install'] as const },
					{ name: 'Storage B', pages: ['retry', 'incident'] as const },
					{ name: 'Storage C', pages: ['install', 'incident'] as const },
				].map(node => <div key={node.name} className="rounded-xl border border-border bg-muted/20 p-3">
					<p className="mb-3 flex items-center gap-2 text-xs font-medium"><Server size={14} aria-hidden="true" />{node.name}</p>
					<div className="space-y-2">{node.pages.map(page => <Page key={page} name={{ retry: 'Retry page', install: 'Installation', incident: 'Incidents' }[page]} color={page} />)}</div>
					<p className="mt-3 border-t border-dashed border-border pt-2 text-[11px] text-muted-foreground">Own transaction journal</p>
				</div>)}
			</div>
		</Diagram>
	);
}
