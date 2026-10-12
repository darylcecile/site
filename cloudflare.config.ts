import { bindings, defineConfig, defineWorker } from 'cf/config';

export default defineConfig({
	accountId: 'a8f7a4b5985cc49fd440ab9f564a7cec',
	worker: defineWorker({
		name: 'darylcecile-site',
		entrypoint: './src/server.ts',
		compatibilityDate: '2026-10-01',
		compatibilityFlags: ['nodejs_compat'],
		workersDev: true,
		domains: ['darylcecile.net', 'www.darylcecile.net'],
		assets: { notFoundHandling: 'none' },
		env: {
			ASSETS: bindings.assets(),
			IMAGES: bindings.images(),
			SITE_CACHE: bindings.kv({ id: '652503497f684bdcb77c03c4d5fecf34' }),
			GITHUB_TOKEN: bindings.secret(),
		},
		observability: { enabled: true },
	}),
});
