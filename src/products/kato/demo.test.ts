import { describe, expect, test } from 'bun:test';
import { examples } from './examples';
import { outputLimits, runDemo, serialize } from './demo';

function exampleValue(index: number, profile = '') {
	const result = runDemo({ source: examples[index].source, profile });
	expect(result.error).toBeUndefined();
	return { value: JSON.parse(result.value!), ast: JSON.parse(result.ast!) };
}

describe('Kato playground reference behavior', () => {
	test('agent config resolves fixture values while preserving advisory metadata and docs in the AST', () => {
		const { value, ast } = exampleValue(0);
		expect(value.assistant).toEqual({ model: 'sample-model', region: 'eu-west-1', timeout: { $unit: 's', value: 30 }, streaming: true, tools: ['search', 'read'] });
		expect(Object.keys(value)).toEqual(['shared', 'assistant']);
		expect(ast.directives.find((directive: { name: string }) => directive.name === 'agent')).toBeDefined();
		const assistant = ast.body.find((node: { name: string }) => node.name === 'assistant');
		expect(assistant.body.members.find((node: { key: string }) => node.key === 'timeout').leadingComments[0].text).toContain('Maximum time');
	});

	test('literal and tool-result examples retain real runtime types', () => {
		expect(exampleValue(1).value.values).toEqual({ answer: 'yes', enabled: true, literal: 'on', count: 42, ratio: 1.5, empty: null, timeout: { $unit: 's', value: 30 }, memory: { $unit: 'MiB', value: 512 }, rate: { $unit: '/min', value: 100 } });
		const result = exampleValue(2).value.result;
		expect(result.elapsed).toEqual({ $unit: 'ms', value: 240 });
		expect(result.truncated).toBe(false);
		expect(result.matches).toEqual([{ file: 'src/config.ts', line: 12, excerpt: 'timeout: 30s' }]);
	});

	test('a proposed profile changes the result only when selected', () => {
		expect(exampleValue(3).value).toEqual({ assistant: { timeout: { $unit: 's', value: 30 } }, tools: ['search', 'debug'] });
		expect(exampleValue(3, 'approved').value).toEqual({ assistant: { timeout: { $unit: 's', value: 60 } }, tools: ['search', 'read'] });
	});

	test('syntax errors expose the actual parser location or explicitly identified EOF', () => {
		const missing = runDemo({ source: 'server {\n  port:\n}', profile: '' });
		expect(missing.error).toMatchObject({ stage: 'parse', line: 2, column: 8 });
		expect(missing.error?.message).toContain('expected value');
		expect(missing.ast).toBeUndefined();
		const unclosed = runDemo({ source: 'server {', profile: '' });
		expect(unclosed.error).toMatchObject({ stage: 'parse', line: 1, column: 9, atEnd: true });
	});

	test('evaluator errors preserve valid ASTs and do not read process environment', () => {
		for (const source of ['secret: env("HOME")', 'region: ref("later.region")', 'value: mystery("x")']) {
			const result = runDemo({ source, profile: '' });
			expect(result.error?.stage).toBe('evaluate');
			expect(JSON.parse(result.ast!).type).toBe('Document');
			expect(result.value).toBeUndefined();
		}
		expect(runDemo({ source: 'region: env("MISSING", fallback: "local")', profile: '' }).value).toContain('"local"');
		expect(runDemo({ source: '', profile: '' }).value).toBe('{}');
	});

	test('display serialization never silently changes unsupported numeric values to strings or null', () => {
		const result = serialize({ large: 9007199254740993n, infinite: Infinity });
		expect(result.tagged).toBe(true);
		expect(JSON.parse(result.text)).toEqual({ large: { $jsType: 'bigint', value: '9007199254740993' }, infinite: { $jsType: 'number', value: 'Infinity' } });
		expect(runDemo({ source: 'huge: 1e999', profile: '' }).tagged).toBe(true);
	});

	test('user-supplied evaluator text cannot forge a source location', () => {
		for (const source of ['value: env("at line 1:9999999999")', 'value: ref("at line 1:2")']) {
			const result = runDemo({ source, profile: '' });
			expect(result.error?.stage).toBe('evaluate');
			expect(result.error?.line).toBeUndefined();
			expect(result.error?.column).toBeUndefined();
			expect(JSON.parse(result.ast!).type).toBe('Document');
		}
	});

	test('repeated references cannot expand a short document into an unbounded worker response', () => {
		const source = ['v0: ["x"]', ...Array.from({ length: 16 }, (_, i) => `v${i + 1}: [ref("v${i}"), ref("v${i}")]`)].join('\n');
		const result = runDemo({ source, profile: '' });
		expect(result.error?.stage).toBe('output');
		expect(result.error?.message).toContain('Evaluated output');
		expect(result.value).toBeUndefined();
		expect(JSON.parse(result.ast!).body).toHaveLength(17);
		expect(result.ast!.length).toBeLessThanOrEqual(outputLimits.characters);
	});

	test('AST, nesting, and string budgets reject oversized displays while retaining ordinary long values', () => {
		const source = Array.from({ length: 1200 }, (_, i) => `a${i}: 1`).join('\n');
		expect(source.length).toBeLessThan(12000);
		const astLimit = runDemo({ source, profile: '' });
		expect(astLimit.error?.stage).toBe('output');
		expect(astLimit.error?.message).toContain('Typed AST');
		expect(astLimit.ast).toBeUndefined();
		expect(astLimit.value).toBeUndefined();
		const nested = runDemo({ source: `value: ${'['.repeat(60)}0${']'.repeat(60)}`, profile: '' });
		expect(nested.error?.stage).toBe('output');
		expect(() => serialize('x'.repeat(outputLimits.string + 1))).toThrow(/string.*limit/);
		const longValue = 'x'.repeat(8000);
		const allowed = runDemo({ source: `value: "${longValue}"`, profile: '' });
		expect(allowed.error).toBeUndefined();
		expect(JSON.parse(allowed.value!).value).toBe(longValue);
	});
});
