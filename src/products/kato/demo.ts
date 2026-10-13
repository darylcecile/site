import { evaluate, parse } from './reference';
import { ParseError } from './reference/parser';
import { sampleEnvironment } from './examples';

export type DemoRequest = { source: string; profile: string };
export type DemoError = {
	stage: 'parse' | 'evaluate' | 'output' | 'runtime';
	message: string;
	line?: number;
	column?: number;
	atEnd?: boolean;
};
export type DemoResult = { ast?: string; value?: string; tagged?: boolean; error?: DemoError };

export const outputLimits = { characters: 64_000, nodes: 4_000, depth: 40, string: 12_000 } as const;

class OutputLimitError extends Error {}

// JSON has no representation for these JS values. Display explicit type tags
// rather than silently turning non-finite numbers into null or losing BigInts.
export function serialize(value: unknown, label = 'Output'): { text: string; tagged: boolean } {
	let tagged = false;
	let nodes = 0;
	let characters = 0;
	const parents: object[] = [];
	const limit = (reason: string) => new OutputLimitError(`${label} exceeds the ${reason} display limit.`);
	const text = JSON.stringify(value, function (this: object, key: string, item: unknown) {
		// Count every occurrence, including shared ref() values. Stop native JSON
		// traversal before it can expand a small DAG into millions of characters.
		while (parents.length && parents[parents.length - 1] !== this) parents.pop();
		if (++nodes > outputLimits.nodes) throw limit(`${outputLimits.nodes.toLocaleString('en-US')}-value`);
		if (parents.length > outputLimits.depth) throw limit(`${outputLimits.depth}-level`);
		if (key.length > outputLimits.string || (typeof item === 'string' && item.length > outputLimits.string)) {
			throw limit(`${outputLimits.string.toLocaleString('en-US')}-character string`);
		}
		if (typeof item === 'bigint' || (typeof item === 'number' && !Number.isFinite(item))) {
			tagged = true;
			item = { $jsType: typeof item, value: String(item) };
		}
		if (item === undefined || typeof item === 'function') {
			tagged = true;
			item = { $jsType: typeof item };
		}
		const container = item !== null && typeof item === 'object';
		// Include escaped strings/keys and a conservative allowance for both
		// opening/closing indentation and separators, before appending this node.
		characters += JSON.stringify(key).length + (container ? 2 : (JSON.stringify(item)?.length ?? 4)) + 6 + parents.length * 4;
		if (characters > outputLimits.characters) throw limit(`${outputLimits.characters.toLocaleString('en-US')}-character output`);
		if (container) parents.push(item as object);
		return item;
	}, 2);
	if (text && text.length > outputLimits.characters) throw limit(`${outputLimits.characters.toLocaleString('en-US')}-character output`);
	return { text: text ?? 'null', tagged };
}

function diagnostic(error: unknown, source: string, stage: DemoError['stage']): DemoError {
	const message = error instanceof Error ? error.message : String(error);
	if (error instanceof OutputLimitError) return { stage: 'output', message };
	// Evaluator messages can contain arbitrary env/ref names. Only the parser's
	// own error suffix is a location, and even that must fit the actual source.
	if (stage !== 'parse' || !(error instanceof ParseError)) return { stage, message };
	const lines = source.split('\n');
	const location = / at line (\d+)(?::(\d+))?(?:, got .*)?$/.exec(message);
	if (location) {
		const line = Number(location[1]);
		const column = location[2] ? Number(location[2]) : undefined;
		const validLine = Number.isSafeInteger(line) && line >= 1 && line <= lines.length;
		const validColumn = column === undefined || (Number.isSafeInteger(column) && column >= 1 && column <= (lines[line - 1]?.length ?? -1) + 1);
		if (validLine && validColumn) return { stage, message, line, column };
	}
	if (/^unclosed (object|array)/.test(message)) {
		return { stage, message, line: lines.length, column: lines[lines.length - 1].length + 1, atEnd: true };
	}
	return { stage, message };
}

export function runDemo({ source, profile }: DemoRequest): DemoResult {
	let ast: ReturnType<typeof serialize>;
	try {
		ast = serialize(parse(source), 'Typed AST');
	} catch (error) {
		return { error: diagnostic(error, source, 'parse') };
	}
	try {
		const value = serialize(evaluate(source, { env: { ...sampleEnvironment }, profile: profile || undefined }), 'Evaluated output');
		return { ast: ast.text, value: value.text, tagged: ast.tagged || value.tagged };
	} catch (error) {
		return { ast: ast.text, error: diagnostic(error, source, 'evaluate') };
	}
}
