import { join } from 'node:path';
import { resolveUserHome, RouteStore } from 'portless';
import type { Plugin } from 'vite';
import { productIds } from '../src/lib/product-sites.ts';

export function portlessProductsPlugin(): Plugin {
	let cleanup = () => {};

	return {
		name: 'portless-product-hosts',
		apply: 'serve',
		configureServer(server) {
			const publicUrl = process.env.PORTLESS_URL;
			const httpServer = server.httpServer;
			const bypass = ['0', 'false', 'skip'].includes(process.env.PORTLESS ?? '');
			if (!publicUrl || !httpServer || bypass) return;

			const base = new URL(publicUrl);
			const localName = /^(?:([a-z0-9-]+(?:\.[a-z0-9-]+)*)\.)?site\.darylcecile\.localhost$/.exec(base.hostname);
			if (!localName) {
				throw new Error('Website development requires site.darylcecile.localhost or a worktree subdomain of it.');
			}
			const branchPrefix = localName[1] ? `${localName[1]}.` : '';
			const store = new RouteStore(process.env.PORTLESS_STATE_DIR || join(resolveUserHome(), '.portless'), {
				onWarning: (message) => server.config.logger.warn(message),
			});
			const registered = new Set<string>();
			cleanup = () => {
				for (const hostname of registered) {
					try {
						store.removeRoute(hostname, process.pid);
						registered.delete(hostname);
					} catch (error) {
						server.config.logger.error(`Could not remove Portless route ${hostname}: ${String(error)}`);
					}
				}
			};

			httpServer.once('listening', () => {
				const address = httpServer.address();
				if (!address || typeof address === 'string') return;
				try {
					for (const product of productIds) {
						const hostname = `${product}.${branchPrefix}projects.darylcecile.localhost`;
						// PID ownership rejects existing aliases and makes cleanup takeover-safe.
						store.addRoute(hostname, address.port, process.pid);
						registered.add(hostname);
					}
				} catch (error) {
					cleanup();
					httpServer.emit('error', error);
					return;
				}
				for (const hostname of registered) {
					server.config.logger.info(`  ➜  Website: ${base.protocol}//${hostname}${base.port ? `:${base.port}` : ''}/`);
				}
			});
		},
		closeServer() {
			cleanup();
		},
	};
}
