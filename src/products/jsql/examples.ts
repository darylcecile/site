const orders = `[
  {"id":101,"region":"north","amount":120,"paid":true,"customer":{"city":"Leeds"}},
  {"id":102,"region":"south","amount":80,"paid":true,"customer":{"city":"Brighton"}},
  {"id":103,"region":"north","amount":40,"paid":false,"customer":{"city":"York"}},
  {"id":104,"region":"north","amount":60,"paid":true,"customer":{"city":"Leeds"}}
]`;

export const examples = [
	{
		id: 'revenue',
		label: 'Paid revenue',
		question: 'Which region brought in the most paid revenue?',
		input: orders,
		sql: 'SELECT region, sum(amount) AS total\nFROM data\nWHERE paid = 1\nGROUP BY region\nORDER BY total DESC',
		note: 'Four orders become two totals. The unpaid order is left out before SQLite adds them up.',
	},
	{
		id: 'nested',
		label: 'Nested values',
		question: 'Which cities are the paid orders going to?',
		input: orders,
		sql: "SELECT id, json_extract(customer, '$.city') AS city\nFROM data\nWHERE paid = 1\nORDER BY id",
		note: 'Nested objects stay JSON text. SQLite’s json_extract reads the property you ask for.',
	},
	{
		id: 'tools',
		label: 'Tool results',
		question: 'Which checks need the agent’s attention?',
		input: `[
  {"check":"lint","status":"passed","message":null},
  {"check":"typecheck","status":"failed","message":"Missing property: name"},
  {"check":"unit tests","status":"passed","message":null},
  {"check":"build","status":"failed","message":"Cannot resolve ./config"}
]`,
		sql: "SELECT \"check\", message\nFROM data\nWHERE status = 'failed'\nORDER BY \"check\"",
		note: 'An example tool-result array: return the failures and their messages, then decide what to fix.',
	},
	{
		id: 'logs',
		label: 'JSON logs',
		question: 'Which service has the most error entries?',
		input: `[
  {"service":"payments","level":"error","message":"Request timed out"},
  {"service":"search","level":"info","message":"Index refreshed"},
  {"service":"payments","level":"error","message":"Connection reset"},
  {"service":"search","level":"error","message":"Query timed out"},
  {"service":"payments","level":"info","message":"Retry succeeded"}
]`,
		sql: "SELECT service, count(*) AS errors\nFROM data\nWHERE level = 'error'\nGROUP BY service\nORDER BY errors DESC, service",
		note: 'These sample logs are one JSON array. jsql expects one JSON document, not newline-delimited JSON.',
	},
] as const;
