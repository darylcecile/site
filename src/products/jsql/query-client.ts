import { limits, validateSize, type QueryInput, type QueryResult, type WorkerReply } from './query-contract';

type Callbacks = {
	onRunning: () => void;
	onResult: (result: QueryResult) => void;
	onError: (message: string) => void;
};

export function startQuery(request: QueryInput, callbacks: Callbacks) {
	validateSize(request);
	const worker = new Worker(new URL('./query.worker.ts', import.meta.url), { type: 'module' });
	let active = true;
	let timeout: ReturnType<typeof setTimeout>;
	const stop = () => {
		active = false;
		clearTimeout(timeout);
		worker.terminate();
	};
	const fail = (message: string) => {
		if (!active) return;
		stop();
		callbacks.onError(message);
	};
	timeout = setTimeout(() => fail('SQLite could not load within 15 seconds. Check your connection and run the query again.'), limits.loadMs);
	worker.onerror = () => fail('The SQLite worker could not start. Run again, or try a browser with WebAssembly support.');
	worker.onmessageerror = () => fail('The browser could not read the query result. Run the query again.');
	worker.onmessage = (event: MessageEvent<WorkerReply>) => {
		if (!active) return;
		const message = event.data;
		if (message.type === 'ready') {
			clearTimeout(timeout);
			timeout = setTimeout(() => fail('Stopped after 3 seconds. Simplify the query or reduce the input, then run again.'), limits.queryMs);
			callbacks.onRunning();
			worker.postMessage(request);
		} else if (message.type === 'result') {
			stop();
			callbacks.onResult(message.result);
		} else {
			fail(message.message);
		}
	};
	return stop;
}
