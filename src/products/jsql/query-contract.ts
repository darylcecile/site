export const limits = {
	inputBytes: 256 * 1024,
	sqlBytes: 8 * 1024,
	outputBytes: 512 * 1024,
	rows: 1_000,
	columns: 128,
	loadMs: 15_000,
	queryMs: 3_000,
} as const;

export type QueryInput = { input: string; sql: string };
export type QueryResult = { output: string; rowCount: number; sqliteVersion: string };
export type WorkerReply =
	| { type: 'ready' }
	| { type: 'result'; result: QueryResult }
	| { type: 'error'; message: string };

export function validateSize({ input, sql }: QueryInput) {
	const encoder = new TextEncoder();
	if (encoder.encode(input).byteLength > limits.inputBytes) {
		throw new Error('This browser demo accepts up to 256 KiB of JSON. Use the CLI for a larger document.');
	}
	if (encoder.encode(sql).byteLength > limits.sqlBytes) {
		throw new Error('Keep the SQL query under 8 KiB in this browser demo.');
	}
	if (!sql.trim()) throw new Error('Enter a SQL query, for example: SELECT * FROM data');
}
