import { createServerFn } from "@tanstack/react-start";
import { loadGithubActivity, loadGithubProfile } from "./github.server";
import { loadLinkMetadata } from "./metadata.server";
import { loadTweet } from "./tweet.server";
import { validateGithubHandle, validateMetadataUrl, validateTweetId } from "./preview-validation";

export const getGithubProfile = createServerFn({ method: "GET" })
	.validator(validateGithubHandle)
	.handler(({ data }) => loadGithubProfile(data));

export const getGithubActivity = createServerFn({ method: "GET" })
	.validator(validateGithubHandle)
	.handler(({ data }) => loadGithubActivity(data));

export const getLinkMetadata = createServerFn({ method: "GET" })
	.validator(validateMetadataUrl)
	.handler(({ data }) => loadLinkMetadata(data));

export const getEmbeddedTweet = createServerFn({ method: "GET" })
	.validator(validateTweetId)
	.handler(({ data }) => loadTweet(data));
