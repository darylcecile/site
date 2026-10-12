import { EmbeddedTweet, TweetNotFound, TweetSkeleton } from "react-tweet";
import { getEmbeddedTweet } from "@/lib/server/previews.functions";
import { usePreviewData } from "@/lib/usePreviewData";

type TweetRendererProps = {
	tweetId: string;
};

const loadTweet = (tweetId: string, signal: AbortSignal) => getEmbeddedTweet({ data: tweetId, signal });

export default function TweetRenderer({ tweetId }: TweetRendererProps) {
	const { data: tweet, status } = usePreviewData(tweetId, true, loadTweet);

	return (
		<div className={'flex flex-col max-w-2xl w-full items-center'}>
			{tweet ? <EmbeddedTweet tweet={tweet} /> : status === "error" ? <TweetNotFound /> : (
				<div role="status" aria-label="Loading tweet" className="w-full max-w-[550px]">
					<TweetSkeleton />
				</div>
			)}
		</div>
	);
}
