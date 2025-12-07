
export function GET(req: Request) {
	const url = new URL(req.url);
	const resource = url.searchParams.get('resource') as string;

	if (resource?.includes("@")) {
		const [user, domain] = resource.split("@");
		const knownNames = ["me", "daryl", "dazza"].map(
			(name) => `acct:${name}`,
		);
		if (knownNames.includes(user) && domain === "darylcecile.net") {
			return Response.json({
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
		}
	}

	return Response.json({
		Error: "Unknown request",
		resource,
	}, { status: 404 });
};
