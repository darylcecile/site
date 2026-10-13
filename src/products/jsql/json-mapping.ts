/**
 * Browser adaptation of column(), scan_schema(), and jsql_query() in:
 * https://github.com/darylcecile/jsql/blob/c1eb8da635aabb84097d6730787d2e696afedbe3/src/bridge.c
 * Copyright (c) 2026 Daryl Cecile. MIT; see UPSTREAM-LICENSE.
 *
 * The native bridge retains JSONB and discovers keys with a C scanner. Here,
 * SQLite discovers the same row keys and json_each reads retained JSON text.
 * SQLite still performs all JSON parsing, value conversion, and SQL execution.
 */
import type { Database, SqlJsStatic, SqlValue } from 'sql.js';
import { limits, validateSize, type QueryInput, type QueryResult } from './query-contract';

function quoteText(value: string) {
	return `'${value.replaceAll("'", "''")}'`;
}

function column(key: string) {
	const fallback = key === 'value'
		? "CASE WHEN row.type='array' THEN json(row.value) ELSE row.value END"
		: 'NULL';
	return `CASE WHEN row.type='object' THEN json_extract(row.value,'$.'||json_quote(${quoteText(key)})) ELSE ${fallback} END AS "${key.replaceAll('"', '""')}"`;
}

function createDataView(db: Database, input: string) {
	const valid = db.exec('SELECT json_valid(?)', [input])[0]?.values[0]?.[0];
	if (valid !== 1) throw new Error('Input must be one valid JSON document. Check for missing quotes or trailing commas.');
	const document = input.trimStart().startsWith('[') ? input : `[${input}]`;
	db.create_function('_input', () => document);
	const keys = new Set<string>();
	const schema = db.prepare(`
		SELECT CASE WHEN row.type='object' THEN field.key ELSE 'value' END
		FROM json_each(_input()) AS row
		LEFT JOIN json_each(CASE WHEN row.type='object' THEN row.value ELSE '{}' END) AS field
	`);
	try {
		while (schema.step()) {
			const key = schema.get()[0];
			if (typeof key !== 'string') continue;
			if (key.includes('\0')) throw new Error('This browser demo does not support null characters in column names.');
			keys.add(key);
			if (keys.size > limits.columns) throw new Error('This browser demo supports up to 128 columns. Try a narrower document.');
		}
	} finally {
		schema.free();
	}
	const columns = [...keys].map(column).join(',') || 'NULL AS value';
	db.run(`CREATE VIEW data AS SELECT ${columns} FROM json_each(_input()) AS row`);
}

function serializeValue(value: SqlValue | bigint) {
	// Keep SQLite's signed 64-bit integers intact in the displayed JSON text.
	if (typeof value === 'bigint') return value.toString();
	return JSON.stringify(value);
}

function collectRows(db: Database, sql: string) {
	// Like the native CLI's sqlite3_prepare_v3, prepare executes the first statement.
	const statement = db.prepare(sql);
	const rows: string[] = [];
	let bytes = 2;
	try {
		// sql.js 1.14 supports useBigInt; @types/sql.js still omits that argument.
		const getRow = statement.get.bind(statement) as (params: null, config: { useBigInt: true }) => (SqlValue | bigint)[];
		const columns = statement.getColumnNames().map(name => JSON.stringify(name));
		if (columns.length === 0) throw new Error('Enter a query that returns columns, such as SELECT * FROM data.');
		while (statement.step()) {
			if (rows.length === limits.rows) throw new Error('The result exceeds 1,000 rows. Add a LIMIT or narrow the query.');
			const values = getRow(null, { useBigInt: true });
			const row = `{${values.map((value, index) => `${columns[index]}:${serializeValue(value)}`).join(',')}}`;
			bytes += new TextEncoder().encode(row).byteLength + 4;
			if (bytes > limits.outputBytes) throw new Error('The result exceeds 512 KiB. Select fewer columns or add a LIMIT.');
			rows.push(row);
		}
		return { output: rows.length ? `[\n  ${rows.join(',\n  ')}\n]` : '[]', rowCount: rows.length };
	} finally {
		statement.free();
	}
}

export function queryJson(SQL: SqlJsStatic, request: QueryInput): QueryResult {
	validateSize(request);
	const db = new SQL.Database();
	try {
		db.run('PRAGMA temp_store=MEMORY; PRAGMA hard_heap_limit=33554432;');
		createDataView(db, request.input);
		db.run('PRAGMA query_only=ON;');
		const sqliteVersion = String(db.exec('SELECT sqlite_version()')[0].values[0][0]);
		return { ...collectRows(db, request.sql), sqliteVersion };
	} finally {
		db.close();
	}
}
