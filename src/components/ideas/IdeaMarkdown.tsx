import type { ComponentPropsWithoutRef } from 'react';
import MarkdownRenderer from '@/components/utils/renderers/MarkdownRenderer';
import { generateIdFromText } from '@/lib/generateIdFromText';
import { ChangeIdentity } from './kelp/ChangeIdentity';
import { ConcurrentRevisions } from './kelp/ConcurrentRevisions';
import { LandingExperiment } from './kelp/LandingExperiment';
import { GitSnapshots } from './kelp/GitSnapshots';
import { ProjectStorage } from './kelp/ProjectStorage';

function SectionHeading({ children, ...props }: ComponentPropsWithoutRef<'h2'>) {
	const id = generateIdFromText(children);
	return <h2 {...props} id={id}><a href={`#${id}`}>{children}</a></h2>;
}

const components = { h2: SectionHeading, GitSnapshots, ChangeIdentity, ConcurrentRevisions, LandingExperiment, ProjectStorage };

export function IdeaMarkdown({ content }: { content: string }) {
	return <MarkdownRenderer content={content} components={components} />;
}
