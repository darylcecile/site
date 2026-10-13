import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';
import { queryJson } from './json-mapping';
import type { QueryInput, WorkerReply } from './query-contract';

function reply(message: WorkerReply) {
	self.postMessage(message);
}

function fail(error: unknown) {
	reply({ type: 'error', message: error instanceof Error ? error.message : String(error) });
}

initSqlJs({ locateFile: () => wasmUrl }).then(SQL => {
	self.onmessage = (event: MessageEvent<QueryInput>) => {
		try {
			reply({ type: 'result', result: queryJson(SQL, event.data) });
		} catch (error) {
			fail(error);
		}
	};
	reply({ type: 'ready' });
}).catch(fail);
