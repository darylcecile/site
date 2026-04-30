import type { ReactNode } from 'react';

function nodeToString(node: ReactNode): string {
	if (node === null || node === undefined || typeof node === 'boolean') return '';
	if (typeof node === 'string' || typeof node === 'number') return String(node);
	if (Array.isArray(node)) return node.map(nodeToString).join('');
	if (typeof node === 'object' && 'props' in node) {
		// biome-ignore lint/suspicious/noExplicitAny: react element children
		return nodeToString((node as any).props?.children);
	}
	return '';
}

/**
 * create an HTML id-safe string from the text
 */
export function generateIdFromText(text: ReactNode | string) {
	const source = typeof text === 'string' ? text : nodeToString(text);

	const id = source
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/--+/g, '-');
	return id;
}