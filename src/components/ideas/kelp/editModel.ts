export type PageEdit = { parents: string[]; content: string };
export type HandbookCommit = { id: string; label: string; edits: Record<string, PageEdit> };

export const originalHandbook: HandbookCommit = {
	id: 'original',
	label: 'Original handbook',
	edits: {
		'operations/retries.md': { parents: [], content: 'Retry failed requests.' },
		'docs/installation.md': { parents: [], content: 'Install the lastest release.' },
	},
};

export const retryEdit: HandbookCommit = {
	id: 'retry-edit',
	label: 'Clarify retry guidance',
	edits: { 'operations/retries.md': { parents: ['original'], content: 'Retry only transient failures.' } },
};

export function secondEdit(samePage: boolean): HandbookCommit {
	return {
		id: 'second-edit',
		label: samePage ? 'Disable automatic retries' : 'Fix the installation typo',
		edits: samePage
			? { 'operations/retries.md': { parents: ['original'], content: 'Never retry automatically.' } }
			: { 'docs/installation.md': { parents: ['original'], content: 'Install the latest release.' } },
	};
}

export const retryResolution: HandbookCommit = {
	id: 'resolution',
	label: 'Resolve the retry policy',
	edits: { 'operations/retries.md': { parents: ['retry-edit', 'second-edit'], content: 'Retry only transient failures.' } },
};

// The same two-pass rule described in Kelp's transaction model: collect versions,
// then remove the particular parents consumed by included edits. These fixtures
// always include complete dependencies; no hashing or text merging is simulated.
export function handbookView(commits: HandbookCommit[]) {
	const pages = new Map<string, Map<string, string>>();
	for (const commit of commits) {
		for (const [path, edit] of Object.entries(commit.edits)) {
			if (!pages.has(path)) pages.set(path, new Map());
			pages.get(path)!.set(commit.id, edit.content);
		}
	}
	for (const commit of commits) {
		for (const [path, edit] of Object.entries(commit.edits)) {
			for (const parent of edit.parents) pages.get(path)!.delete(parent);
		}
	}
	return [...pages].map(([path, versions]) => ({
		path,
		versions: [...versions].sort(([a], [b]) => a.localeCompare(b)).map(([id, content]) => ({ id, content })),
	}));
}
