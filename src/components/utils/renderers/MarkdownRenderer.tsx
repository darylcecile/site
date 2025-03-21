import { MDXRemote } from 'next-mdx-remote/rsc';
import TweetRenderer from '@/components/utils/renderers/TweetRenderer';
import InfoBox from '../InfoBox';
import ResponsiveImgRenderer from '@/components/utils/renderers/ResponsiveImgRenderer';
import CodeRenderer from '@/components/utils/renderers/CodeRenderer';

type Props = {
	content: string;
}

export default function MarkdownRenderer(props: Props) {

	return (
		<MDXRemote
			source={props.content}
			components={{
				'Abbr': 'abbr',
				'TweetRenderer': TweetRenderer,
				'InfoBox': InfoBox,
				'img': ResponsiveImgRenderer,
				'p': (props: any) => {
					if (typeof props.children !== "string" && "type" in props.children) {
						if (["ResponsiveImgRenderer", "TweetRenderer"].includes(props.children.type.name)) {
							return props.children;
						}
					}
					return <p>{props.children}</p>;
				},
				'pre': (props) => {
					if (props.children.type === 'code') {
						const language = props.children.props.className.replace('language-', '');
						const code = props.children.props.children;
						return <CodeRenderer lang={language}>{code}</CodeRenderer>;
					}
					return <pre {...props} />;
				}
			}}
		/>
	)
}