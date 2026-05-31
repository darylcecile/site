import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import { getTweet } from "react-tweet/api";

type TweetRendererProps = {
	tweetId: string;
};

export default async function TweetRenderer({ tweetId }: TweetRendererProps) {
	let tweet: Awaited<ReturnType<typeof getTweet>> | null = null;
	try {
		tweet = (await getTweet(tweetId)) ?? null;
	}
	catch (error) {
		console.error(`[TweetRenderer] Failed to fetch tweet ${tweetId}:`, error);
	}

	if (tweet) {
		// Some tweets are returned with an empty `entities` object, which causes
		// react-tweet's `addEntities` helper to throw "x is not iterable" while
		// iterating over hashtags/mentions/urls/symbols. Backfill the expected
		// arrays so the component can render safely.
		tweet.entities = {
			hashtags: tweet.entities?.hashtags ?? [],
			urls: tweet.entities?.urls ?? [],
			user_mentions: tweet.entities?.user_mentions ?? [],
			symbols: tweet.entities?.symbols ?? [],
			...(tweet.entities?.media ? { media: tweet.entities.media } : {}),
		};
	}

	return (
		<div className={'flex flex-col max-w-2xl w-full items-center'}>
			{tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />}
		</div>
	);
}
