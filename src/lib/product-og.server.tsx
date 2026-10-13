import { ImageResponse } from '@vercel/og';
import { productIdentity, productMetadata, productNames } from '@/products/registry';
import type { ProductId } from './product-sites';

export function generateProductOgImage(product: ProductId) {
	const { paper, ink, accent, motif, onAccent = 'white' } = productIdentity[product];
	const headline = productMetadata[product].title.split(' — ')[1] ?? productMetadata[product].title;
	return new ImageResponse(
		<div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: 64, background: paper, color: ink }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 23 }}>
				<span>{product}.darylcecile.net</span>
				<span>By Daryl Cecile</span>
			</div>
			<div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 56 }}>
				<div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
					<span style={{ fontSize: 112, lineHeight: 1.1, letterSpacing: -5 }}>{productNames[product]}</span>
					<span style={{ fontSize: 43, lineHeight: 1.3, marginTop: 20 }}>{headline}</span>
				</div>
				<div style={{ display: 'flex', width: 260, height: 260, alignItems: 'center', justifyContent: 'center', borderRadius: 28, background: accent, color: onAccent, fontSize: motif.length > 4 ? 60 : 84 }}>{motif}</div>
			</div>
			<div style={{ display: 'flex', borderTop: `2px solid ${accent}`, paddingTop: 25, fontSize: 22 }}>Examples, interactive demos, and the source behind them.</div>
		</div>,
		{ width: 1200, height: 630 },
	);
}
