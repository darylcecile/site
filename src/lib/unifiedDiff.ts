export type DiffRow = {
	kind: 'added' | 'removed' | 'context' | 'hunk' | 'meta';
	text: string;
	before?: number;
	after?: number;
};

export type FileDiff = { before?: string; after?: string; rows: DiffRow[] };
type Cursor = { before: number; after: number; oldRemaining: number; newRemaining: number };

const emptyCursor = (): Cursor => ({ before: 0, after: 0, oldRemaining: 0, newRemaining: 0 });
const insideHunk = (cursor: Cursor) => cursor.oldRemaining > 0 || cursor.newRemaining > 0;

function readHeader(line: string, file: FileDiff) {
	const headers = [
		['--- ', 'before'], ['+++ ', 'after'],
		['rename from ', 'before'], ['rename to ', 'after'],
	] as const;
	for (const [prefix, key] of headers) {
		if (!line.startsWith(prefix)) continue;
		const path = line.slice(prefix.length).split('\t')[0];
		file[key] = prefix.startsWith('rename') ? path : path.replace(/^[ab]\//, '');
		return true;
	}
	return false;
}

function readRow(line: string, cursor: Cursor): DiffRow {
	const hunk = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
	if (hunk) {
		cursor.before = Number(hunk[1]);
		cursor.after = Number(hunk[3]);
		cursor.oldRemaining = Number(hunk[2] ?? 1);
		cursor.newRemaining = Number(hunk[4] ?? 1);
		return { kind: 'hunk', text: line };
	}
	const kinds = { '+': 'added', '-': 'removed', ' ': 'context' } as const;
	const kind = kinds[line[0] as keyof typeof kinds];
	if (!kind) return { kind: 'meta', text: line };
	const row: DiffRow = { kind, text: line.slice(1) };
	const numbered = insideHunk(cursor);
	if (numbered && kind !== 'added') {
		row.before = cursor.before++;
		cursor.oldRemaining--;
	}
	if (numbered && kind !== 'removed') {
		row.after = cursor.after++;
		cursor.newRemaining--;
	}
	return row;
}

function beginsFile(line: string, file: FileDiff, cursor: Cursor) {
	return line.startsWith('diff --git ')
		|| (!insideHunk(cursor) && line.startsWith('--- ') && file.before !== undefined && file.after !== undefined);
}

/** Parse unified text diffs, preserving unrecognized metadata as visible text. */
export function parseUnifiedDiff(source: string): FileDiff[] {
	const files: FileDiff[] = [];
	let file: FileDiff = { rows: [] };
	let cursor = emptyCursor();
	const lines = source.replace(/\r\n/g, '\n').split('\n');
	if (lines.at(-1) === '') lines.pop();

	for (const line of lines) {
		if (beginsFile(line, file, cursor)) {
			if (file.rows.length || file.before || file.after) files.push(file);
			file = { rows: [] };
			cursor = emptyCursor();
		}
		if (!insideHunk(cursor) && readHeader(line, file)) continue;
		file.rows.push(readRow(line, cursor));
	}
	if (file.rows.length || file.before || file.after) files.push(file);
	return files;
}
