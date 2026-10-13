import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { productForHostname } from './product-sites';

export const getCurrentProduct = createIsomorphicFn()
	.server(() => productForHostname(new URL(getRequest().url).hostname))
	.client(() => productForHostname(window.location.hostname));
