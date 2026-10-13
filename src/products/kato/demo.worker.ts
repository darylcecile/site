import { runDemo, type DemoRequest } from './demo';

self.onmessage = (event: MessageEvent<DemoRequest>) => {
	self.postMessage(runDemo(event.data));
};
