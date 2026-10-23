import type { ProductId } from '@/lib/product-sites';
import * as jsvm from './jsvm/meta';
import * as sakoa from './sakoa/meta';
import * as kato from './kato/meta';
import * as jsql from './jsql/meta';
import * as binzo from './binzo/meta';
import * as groundwork from './groundwork/meta';
import * as tuna from './tuna/meta';

export type ProductMetadata = {
	title: string;
	description: string;
	repository: string;
};

export const productMetadata: Record<ProductId, ProductMetadata> = { jsvm, sakoa, kato, jsql, binzo, groundwork, tuna };

export const productNames: Record<ProductId, string> = {
	jsvm: 'JSVM',
	sakoa: 'Sakoa',
	kato: 'Kato',
	jsql: 'jsql',
	binzo: 'Binzo',
	groundwork: 'Groundwork',
	tuna: 'Tuna',
};

export const productIdentity: Record<ProductId, { paper: string; ink: string; accent: string; motif: string; onAccent?: string }> = {
	jsvm: { paper: '#f3f5f9', ink: '#172344', accent: '#304fc4', motif: '{ }' },
	sakoa: { paper: '#f4f3fc', ink: '#27233f', accent: '#5b45bf', motif: 'uses' },
	kato: { paper: '#f6f8f3', ink: '#203a2f', accent: '#164936', motif: '{ }' },
	jsql: { paper: '#f3f7fc', ink: '#182536', accent: '#1458da', motif: 'select' },
	binzo: { paper: '#fffdf5', ink: '#342f25', accent: '#f6d86b', motif: '>_', onAccent: '#342f25' },
	groundwork: { paper: '#f7f8fb', ink: '#222630', accent: '#3559c7', motif: 'G' },
	tuna: { paper: '#e2dcfa', ink: '#302347', accent: '#6540b3', motif: 'tuna' },
};
