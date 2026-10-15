import { productIds, productOrigin } from '@/lib/product-sites';
import { productIdentity, productMetadata, productNames } from '@/products/registry';

/**
 * Links out to each live, subdomained product site. Each card reads its name, colour
 * identity and description from the shared product registry so this stays in sync with
 * the product pages themselves; links are plain cross-origin anchors since every product
 * lives on its own subdomain rather than an internal route.
 */
export function ProductsShowcase() {
	return (
		<section aria-labelledby="products-heading" className="max-w-2xl mx-auto w-full my-14">
			<div className="mb-5 flex items-center justify-between gap-4">
				<h2 id="products-heading" className="text-xl">Live projects</h2>
			</div>
			<ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{productIds.map((product) => {
					const identity = productIdentity[product];
					return (
						<li key={product}>
							<a
								href={productOrigin(product)}
								target="_blank"
								rel="noopener noreferrer"
								className="group relative flex items-start gap-3 overflow-hidden rounded-lg border border-border p-4 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md outline-transparent focus-visible:outline-2 focus-visible:outline-muted focus-visible:outline-offset-1"
								style={{ backgroundColor: identity.paper, color: identity.ink }}
							>
								<img
									src={`/product-icons/${product}.svg`}
									alt=""
									aria-hidden
									loading="lazy"
									className="h-8 w-8 shrink-0"
								/>
								<div className="flex flex-col gap-1 min-w-0">
									<span
										className="text-sm font-semibold tracking-wide"
										style={{ color: identity.accent }}
									>
										{productNames[product]}
									</span>
									<span className="text-xs opacity-80 line-clamp-2">
										{productMetadata[product].description}
									</span>
								</div>
							</a>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
