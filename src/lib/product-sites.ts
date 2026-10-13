export const productIds = ['jsvm', 'sakoa', 'kato', 'jsql', 'binzo'] as const;
export type ProductId = typeof productIds[number];

export function productForHostname(hostname: string): ProductId | null {
	const [name, ...domain] = hostname.toLowerCase().replace(/\.$/, '').split('.');
	if (!productIds.includes(name as ProductId)) return null;
	const parent = domain.join('.');
	const production = parent === 'darylcecile.net';
	const local = parent === 'projects.darylcecile.localhost' || parent.endsWith('.projects.darylcecile.localhost');
	return production || local ? name as ProductId : null;
}

export function productOrigin(product: ProductId) {
	return `https://${product}.darylcecile.net`;
}
