import { Tweet as ReactTweet } from "react-tweet";
import s from "../styles/tweet.module.scss";

type TweetRendererProps = {
	tweetId: string;
};

export default async function TweetRenderer({ tweetId }: TweetRendererProps) {
	return (
		<div className={'flex flex-col max-w-2xl w-full items-center'}>
			<ReactTweet id={tweetId} />
		</div>
	);
}
