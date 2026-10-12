import { getTweet, type Tweet, type TweetBase } from "react-tweet/api";
import { cachedJson } from "./cache.server";

function normalizeEntities(tweet: TweetBase): void {
	// Syndication sometimes returns an empty entities object, including on quotes.
	tweet.entities = {
		hashtags: tweet.entities?.hashtags ?? [],
		urls: tweet.entities?.urls ?? [],
		user_mentions: tweet.entities?.user_mentions ?? [],
		symbols: tweet.entities?.symbols ?? [],
		...(tweet.entities?.media ? { media: tweet.entities.media } : {}),
	};
}

export async function loadTweet(tweetId: string): Promise<Tweet | null> {
	try {
		return await cachedJson(`tweet:${tweetId}`, 86400, async () => {
			const tweet = await getTweet(tweetId, {
				signal: AbortSignal.timeout(5000),
				// Syndication rejects workerd requests without an explicit User-Agent.
				headers: { "User-Agent": "darylcecile.net", Accept: "application/json" },
			});
			if (!tweet) return null;
			normalizeEntities(tweet);
			if (tweet.quoted_tweet) normalizeEntities(tweet.quoted_tweet);
			if (tweet.parent) normalizeEntities(tweet.parent);
			return tweet;
		});
	} catch (error) {
		const reason = error instanceof Error ? `${error.name}: ${error.message}` : "Unknown error";
		console.warn(`[Tweet preview] Could not load tweet ${tweetId}: ${reason.slice(0, 240)}`);
		return null;
	}
}
