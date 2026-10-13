import { VM } from '@catmint-fs/jsvm';
import {
	createIssues, EXECUTION_LIMIT, FIXED_NOW, RANDOM_SEED, SOURCE_LIMIT,
	type DemoReply,
} from './demo';

const worker = globalThis as unknown as {
	postMessage: (message: DemoReply) => void;
	onmessage: ((event: MessageEvent<{ source: string }>) => void) | null;
};

// This file is a separate, on-demand Worker entry. Guest code only reaches VM.eval.
worker.onmessage = async ({ data }) => {
	const calls: string[] = [];
	const started = performance.now();
	let vm: VM | undefined;
	try {
		if (typeof data.source !== 'string' || data.source.length > SOURCE_LIMIT) {
			throw new Error(`Guest code must be at most ${SOURCE_LIMIT.toLocaleString()} characters.`);
		}
		const issues = createIssues();
		vm = new VM({
			capabilities: {
				executionRules: { timeLimit: EXECUTION_LIMIT },
				numbers: { randomSeed: RANDOM_SEED, dateNow: FIXED_NOW },
				networkingRules: [],
				dynamicCode: false,
			},
			globals: {
				issues,
				tools: {
					getIssue(id) {
						if (calls.length >= 8) throw new Error('Demo tool call limit reached (8 calls).');
						if (typeof id !== 'number' || !Number.isInteger(id)) {
							throw new Error('tools.getIssue expects an integer issue ID.');
						}
						const issue = issues.find(item => item.id === id);
						calls.push(`tools.getIssue(${id}) ${issue ? '→ local fixture' : '→ not found'}`);
						if (!issue) throw new Error('Only local issue IDs 101, 102 and 103 are available.');
						return issue;
					},
				},
			},
		});
		await vm.start();
		const result = await vm.eval(data.source);
		worker.postMessage({
			type: 'result',
			ok: result.ok,
			output: result.ok ? formatValue(result.value) : formatValue({
				code: result.error.code,
				message: result.error.message,
				details: result.error.details,
			}),
			code: result.ok ? undefined : result.error.code,
			calls,
			elapsed: Math.round(performance.now() - started),
		});
	} catch (error) {
		worker.postMessage({
			type: 'result', ok: false, code: 'DEMO_ERROR',
			output: error instanceof Error ? error.message.slice(0, 1_000) : 'The demo could not complete this run.',
			calls, elapsed: Math.round(performance.now() - started),
		});
	} finally {
		vm?.dispose();
	}
};

// Keep rich VM values legible without transferring unbounded results to the UI.
// Strings/depth/entries are preview-limited; this is not a VM memory limit.
function formatValue(value: unknown): string {
	let remaining = 160;
	function preview(item: unknown, depth: number): unknown {
		if (remaining-- <= 0) return '[preview limit]';
		if (item === undefined) return '[undefined]';
		if (typeof item === 'bigint') return `${item}n`;
		if (typeof item === 'number' && !Number.isFinite(item)) return `[${item}]`;
		if (typeof item === 'string') return item.length > 600 ? `${item.slice(0, 600)}… [truncated]` : item;
		if (typeof item !== 'object' || item === null) return item;
		if (depth >= 6) return '[depth limit]';
		if (item instanceof Date) return Number.isNaN(item.getTime()) ? '[Invalid Date]' : item.toISOString();
		if (item instanceof RegExp) return String(item);
		if (item instanceof ArrayBuffer) return `[ArrayBuffer: ${item.byteLength} bytes]`;
		if (ArrayBuffer.isView(item)) return `[${item.constructor.name}: ${item.byteLength} bytes]`;
		if (item instanceof Map || item instanceof Set) {
			const values: unknown[] = [];
			for (const entry of item) {
				if (values.length >= 30 || remaining <= 0) { values.push('[preview limit]'); break; }
				values.push(preview(entry, depth + 1));
			}
			return { [item instanceof Map ? 'Map' : 'Set']: values };
		}
		if (Array.isArray(item)) {
			const values = item.slice(0, Math.min(30, Math.max(0, remaining))).map(entry => preview(entry, depth + 1));
			if (values.length < item.length) values.push(`[${item.length - values.length} more entries]`);
			return values;
		}
		const output = Object.create(null) as Record<string, unknown>;
		let count = 0;
		for (const key in item) {
			if (!Object.hasOwn(item, key)) continue;
			if (count++ >= 30 || remaining <= 0) { output['…'] = '[preview limit]'; break; }
			output[key.slice(0, 120)] = preview((item as Record<string, unknown>)[key], depth + 1);
		}
		return output;
	}
	if (value === undefined) return 'undefined';
	return JSON.stringify(preview(value, 0), null, 2);
}

worker.postMessage({ type: 'ready' });
