import { Heading } from '@/components/notes/Heading';
import { AbbrPreview } from '@/components/utils/AbbrPreview';
import CodeRenderer from '@/components/utils/renderers/CodeRenderer';
import ResponsiveImgRenderer from '@/components/utils/renderers/ResponsiveImgRenderer';
import type { MDXComponents } from 'mdx/types.js'
import { isValidElement, lazy, Suspense, type ComponentPropsWithoutRef, type ComponentType } from 'react';
import { contentModules } from '@/generated/content/modules';
import type { ContentCollection } from '@/lib/content/types';
import FancyLink from '../FancyLink';
import InfoBox from '../InfoBox';
import { InlineCodeRenderer } from './InlineCodeRenderer';

type Props = {
	collection: ContentCollection;
	slug: string;
	components?: MDXComponents;
}

const GalleryRenderer = lazy(() => import('./GalleryRenderer'));
const TweetRenderer = lazy(() => import('./TweetRenderer'));
const componentCache = new Map<string, ComponentType<{ components?: MDXComponents }>>();

export default function MarkdownRenderer(props: Props) {
	const modules = contentModules[props.collection];
	const key = `${props.collection}/${props.slug}`;
	if (!Object.hasOwn(modules, props.slug)) throw new Error(`Missing generated content: ${key}`);
	let Content = componentCache.get(key);
	if (!Content) {
		Content = lazy(modules[props.slug]);
		componentCache.set(key, Content);
	}
	return <Suspense fallback={null}><Content components={{ ...components, ...props.components }} /></Suspense>;
}

type PreProps = ComponentPropsWithoutRef<'pre'> & {
	highlightedHtml?: string;
	rawCode?: string;
};

const components: MDXComponents = {
	'Abbr': AbbrPreview,
	'TweetRenderer': TweetRenderer,
	'InfoBox': InfoBox,
	'img': ResponsiveImgRenderer,
	'a': FancyLink,
	'p': (props) => {
		const child = props.children;
		if (isValidElement(child) && (child.type === ResponsiveImgRenderer || child.type === TweetRenderer)) {
			return child;
		}
		return <p>{child}</p>;
	},
	'pre': ({ highlightedHtml, rawCode, ...props }: PreProps) => {
		if (highlightedHtml !== undefined && rawCode !== undefined) {
			return <CodeRenderer html={highlightedHtml} rawCode={rawCode} />;
		}
		return <pre {...props} />;
	},
	'code': (props) => {
		if (props.className?.startsWith('language-')) {
			return <code {...props} data-valley={true} />;
		}
		return <InlineCodeRenderer {...props} />;
	},
	'Gallery': GalleryRenderer,
	'h1': (props) => <Heading level={1} {...props} />,
	'h2': (props) => <Heading level={2} {...props} />,
	'h3': (props) => <Heading level={3} {...props} />,
	'h4': (props) => <Heading level={4} {...props} />,
	'h5': (props) => <Heading level={5} {...props} />,
	'h6': (props) => <Heading level={6} {...props} />,
};
