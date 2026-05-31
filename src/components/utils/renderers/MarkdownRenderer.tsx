import { Heading } from '@/components/notes/Heading';
import { AbbrPreview } from '@/components/utils/AbbrPreview';
import CodeRenderer from '@/components/utils/renderers/CodeRenderer';
import GalleryRenderer from '@/components/utils/renderers/GalleryRenderer';
import ResponsiveImgRenderer from '@/components/utils/renderers/ResponsiveImgRenderer';
import TweetRenderer from '@/components/utils/renderers/TweetRenderer';
import type { MDXComponents } from 'mdx/types.js'
import { MDXRemote, compileMDX } from 'next-mdx-remote/rsc';
import rehypeMdxCodeProps from 'rehype-mdx-code-props'
import FancyLink from '../FancyLink';
import InfoBox from '../InfoBox';
import { InlineCodeRenderer } from './InlineCodeRenderer';

type Props = {
	content: string;
}

export default function MarkdownRenderer(props: Props) {
	return (
		<MDXRemote
			source={props.content}
			components={components}
			options={{
				mdxOptions: {
					rehypePlugins: [rehypeMdxCodeProps],
				},
				blockJS: false,
			}}
		/>
	)
}

const components: MDXComponents = {
	'Abbr': AbbrPreview,
	'TweetRenderer': TweetRenderer,
	'InfoBox': InfoBox,
	'img': ResponsiveImgRenderer,
	'a': FancyLink,
	'p': (props: any) => {
		const child = props.children;
		if (child && typeof child === "object" && !Array.isArray(child) && "type" in child) {
			const typeName = typeof child.type === "function" ? child.type.name : undefined;
			if (typeName && ["ResponsiveImgRenderer", "TweetRenderer"].includes(typeName)) {
				return child;
			}
		}
		return <p>{child}</p>;
	},
	'pre': (props: any) => {
		const child = props.children;
		const childType = child && typeof child === "object" ? child.type : undefined;
		const childTypeName = typeof childType === "function" ? childType.name : undefined;
		if (childType === 'code' || childTypeName === 'code') {
			const className: string = child.props?.className ?? '';
			const language = className.replace('language-', '');
			const code = child.props?.children;
			return <CodeRenderer lang={language} withIntellisense={props.twoslash}>{code}</CodeRenderer>;
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
