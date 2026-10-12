import type { ComponentPropsWithoutRef } from 'react';
import MarkdownRenderer from '@/components/utils/renderers/MarkdownRenderer';
import { generateIdFromText } from '@/lib/generateIdFromText';

function SectionHeading({ children, ...props }: ComponentPropsWithoutRef<'h2'>) {
	const id = generateIdFromText(children);
	return <h2 {...props} id={id}><a href={`#${id}`}>{children}</a></h2>;
}

const components = { h2: SectionHeading };

export function IdeaMarkdown({ slug }: { slug: string }) {
	return <MarkdownRenderer collection="ideas" slug={slug} components={components} />;
}
