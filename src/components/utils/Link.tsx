import { Link as RouterLink } from '@tanstack/react-router';
import type { ComponentProps } from 'react';

export type LinkProps = ComponentProps<'a'> & { href: string };

export default function Link({ href, ...props }: LinkProps) {
	if (href.startsWith('/') && !href.startsWith('//')) {
		return <RouterLink {...props} to={href} />;
	}
	return <a {...props} href={href} />;
}
