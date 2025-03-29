import type { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
	const resource = req.query.resource as string;

	if (resource?.includes("@")) {
		const [user, domain] = resource.split("@");
		const knownNames = ["me", "daryl", "dazza"].map(
			(name) => `acct:${name}`,
		);
		if (knownNames.includes(user) && domain === "darylcecile.net") {
			res.json({
				subject: "acct:daryl@techhub.social",
				aliases: [
					"https://techhub.social/@daryl",
					"https://techhub.social/users/daryl",
				],
				links: [
					{
						rel: "http://webfinger.net/rel/profile-page",
						type: "text/html",
						href: "https://techhub.social/@daryl",
					},
					{
						rel: "self",
						type: "application/activity+json",
						href: "https://techhub.social/users/daryl",
					},
					{
						rel: "http://ostatus.org/schema/1.0/subscribe",
						template:
							"https://techhub.social/authorize_interaction?uri={uri}",
					},
				],
			});
			return;
		}
	}

	res.status(404).json({
		Error: "Unknown request",
		resource,
	});
};
