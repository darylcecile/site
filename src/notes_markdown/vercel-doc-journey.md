---
title: "Doc Journey: ▲Vercel Edition"
date: "2022-02-16"
lastUpdated: "2022-03-01"
snippet: Join me on a cursory journey around the Vercel Documentation, and how I think it could be improved
---

<InfoBox>
<strong>Disclaimer:</strong> While this post outlines some of the issues I've had with the Vercel documentation, it in no way discredits the amazing work the Vercel Team have been doing. Documentation in this industry needs work as a whole, and for the most part, Vercel's documentation has helped me out countless times. This post is intended to note my discoveries, thought-processes, and eventual solution to the issues I came across, as I journey through the documentation. The outcome of this basic-level research will be published and open-sourced.
</InfoBox>


<strong>Update:</strong> Last Thursday (24th Feb), I had the opportunity to chat to [Meg](https://twitter.com/itsmegbird) from Vercel about my experience and journey with the API docs. I have [extended](#update-improvement-suggestion) this note to include my take on how it could be improved.


---

Last week [Rizwana](https://twitter.com/rizbizkits) discovered a cute little [Co-working space](https://www.cobdenplace.co.uk/) in Nottingham. We had been on the lookout for a place where we could carry out some work for <abbr link="https://projectfunction.io" title="ProjectFunction">PF</abbr><sup>[[1]](#reference1)</sup>, as well as potentially run some of our upcoming courses. At the time, I was making some upgrades to [PF Campus](https://projectfunction.io/how-we-teach), trying to enable deployments for students to be able to deploy their work to a portfolio as part of their submission process. With previous versions of Campus being on a dedicated server, we offered learners with the option to privately deploy (onto our infrastructure) or publicly via Netlify; however, now that it has moved onto a serverless model, it was time to revisit the options.

![Campus v1 Deployment to Netlify](/images/campus-deploy1.png)

As the great advocate that she is, she asked if there was a reason we weren't deploying on Vercel. After all, Campus v2 was already deployed on there, so it only made sense.

Early on in 2021, I had the exact same thought. However, after doing a deep dive, I realised that there was no available packages at the time that interfaced well with Vercel to allow us to programmatically manage projects and deployments the way we needed. And upon further venturing, I came to accept that (a) the available REST APIs was in too much of an early stage, and (b) developing a wrapper around it would be more work than I was able to put in given my day-to-day schedules, and the state of Vercel Documentation back then. In fact the latter was the exact reason that initially pushed me to use Netlify to deploy.

Now before anyone jumps onto the "but Daryl, they provide a CLI" - I know! But it was not convenient and using it programmatically in our setup felt like a hack (we weren't using a command-line interface). So it was best to avoid it. 🤷🏽‍♂️

After a nudge to give the APIs a second consideration, I thought '*Well surely the REST APIs would have matured a little by now*', and it did ...kind of. While the APIs looked a lot more stable with [different versions](https://vercel.com/docs/rest-api#introduction/api-basics/versioning) to avoid breaking changes, it still felt a little overwhelming; it felt like a lot of work had to be done on my part to figure out how things work and what the processes were. Some pages had incomplete documentation, while others had incorrect data-types listed for parameters.

### Potential Solution? 🥊

Despite the issues with the doc, I decided to delve into it a bit more. If I could figure out the missing details and expected data for the API endpoints, I could create a wrapper around the API. This became the plan:
  - Set up a project for the wrapper
  - Consolidate the must-have features (based on PF use-case)
  - Work my way through the endpoints and create wrapper functions
  - Write a script that calls each wrapper function, setting up projects and deployments, checking the status, and tearing them down.

I set up a [small project](https://github.com/daryl-cecile/next-controls) locally, and once I had all the dependencies in place to package my Typescript project, the journey through the docs began. Going into it, I only hoped the docs would be enough to fill the gaps; however, after looking through the endpoint documentation, I immediately fell in love with the addition of the `interaface` and `type` definitions (written in TS) for responses! It made the guesswork a little easier; and seeing as I was already using Typescript, it was a case of copy-pasta 🍝.

![Sample response interface for the Aliases Endpoint](/images/vercel-docs-response-interface.png)

Seeing the typescript interface and type definitions brought about a sense of excitement but that feeling was quickly followed by a sense of defeat once I remembered how incomplete the documentation was as a whole. 

### Missing Definition

The first gripe was to do with the [Create new deployment](https://vercel.com/docs/rest-api#endpoints/deployments/create-a-new-deployment) endpoint. It allows you to create deployments using a git source or by attaching files as part of the request. The latter made more sense for our use-case, so I tried to find out what the format and properties should be. Unfortunately, there was no information on this - the little bit of info I found suggested that the `files` property accepted "a list of objects with the files to be deployed". What was this file object? I set up a quick function which made the call to the API endpoint, and attempted to pass the files as a simple key-value object:

```typescript jsx
function CreateDeployment({bearer, forceNew, ...body}:CreateDeploymentParams){
    return axios.request<CreateDeploymentResponse>({
        method: "post",
        url: DEPLOYMENTS_ENDPOINT_V13,
        headers: {
            "Authorization": `BEARER ${bearer}`,
            "Content-Type": "application/json",
        },
        data: {
            name: body.projectId,
            files: body.files,
            target: body.target
        },
        validateStatus: () => true // prevent rejection on failed request
    });
}

CreateDeployment({
  target: "staging",
  projectId: "prj_Ze66UvH4X9...t",
  bearer: process.ENV.VERCEL_TOKEN,
  forceNew: true,
  files: [
    {name: "index.html", data: "<h1>Test</h1>"}
  ]
}).then(res => {
	console.log('Result:', res)
})
```

After giving this a quick run, I received an error `bad_request` with the following message: `Invalid request: 'files[0]' should NOT have additional property 'name'.` This was interesting 🤔 Even though the documentation didnt seem to point out what was needed, the endpoint was doing some type of check to see what properties are expected. Based on the response, it seems `data` is likely expected, but surely there must be a property to specify the file name. After giving 'fileName', and 'filePath' a try (both returning similar errors), I became frustrated and decided to rethink; even if I did manage to guess the name, there is no way data would work without additional formatting - how would I upload image content as a reasonably-lengthened string? 

This realization drove me back to GitHub. Maybe (hopefully?) someone had the same question and found a solution? I searched through all repos including Vercel, but GitHub search really lived up to its bad reputation when it came to code-searching. Luckily they had another tool I could use (currently in beta). Enter [GitHub CodeSearch](https://cs.github.com). 

![GitHub CodeSearch Homepage](/images/Github-CodeSearch.png)

I began searching globally on CodeSearch for the Vercel deployment endpoint and in no time, I came across [TeleportHQ's repo](https://github.com/teleporthq/teleport-code-generators) which defined an [interface](https://cs.github.com/teleporthq/teleport-code-generators/blob/9f86b0edd484ae9cf6e93849d7f7d3924ce3daa0/packages/teleport-publisher-vercel/src/types.ts#L10) named `VercelFile`. I was a little annoyed I didn't try `file` as a property, but so relieved that there was a drop-in definition I could use.

After dropping in the definition and updating the above code, I gave it another run, and alas the deployment succeeded!

![Successful deployment shown in Vercel](/images/vercel-deploy-result1.png)

Once this step was cleared, I decided to go back to the documentation and see whether any of the optional query parameters for this endpoint would be of use for PF's use-case; and that's when I came across the second issue.

### Unknown Types

This issue ended up being less of a blocker as some guesswork closed the gaps and allowed me to move forward, however I thought it was notable enough as in some cases, there were discrepancies between types. 

Looking at the deployment endpoint's query param options, I could see some properties were unknown. I checked the documentation's own [Types](https://vercel.com/docs/rest-api#introduction/api-basics/types) section to see if this had some explanation, but it didn't.  

![Unknown types in the docs](/images/Unknown-types-deploy.png)

As ive mentioned before, this was less of an issue and more of an inconvenience as I was able to guess the data types for those parameters. 

### Final Notes: PF + ▲ = 💜

As noted by Vercel, changes that they make to the APIs will be outlined in their changelogs, and it is possible that some outlined issues above could have cropped up there, however, this exploration was purely to build a wrapper around the API for consumption by PF (as I couldn't find a suitable one that already existed).

While this post outlines a couple of issues that I have personally come across while navigating the API endpoints that Vercel provides, It does not reflect the quality of their product or support that they provide. I personally<sup>[[2]](#reference2)</sup> use their platform for numerous projects, and it has served me well; I continue to recommend them to friends and learners at ProjectFunction.

Eventually, I was able to wrap a couple of the endpoints that I thought would be useful for PF, and I have to admit, the journey was fun. Moving forward, I can now integrate Vercel into the core of PFCampus to allow learners to deploy their work to showcase their abilities.

The resulting wrapper can be found on my [GitHub repo](https://github.com/daryl-cecile/next-controls). Feel free to use and contribute!

<strong>P.S.</strong> Make sure you [follow me](https://twitter.com/@darylcecile) on the bird app for updates ✌🏽

<br/>

---
### Update: Improvement suggestion
As mentioned in my update note, I had a chance to chat to [Meg](https://twitter.com/itsmegbird) last Thursday (24th Feb) about my experience and journey with the API docs. At the end of our talk, Meg asked "If you could change anything about the docs site, what would it be?" and it got me thinking. I remembered not long ago, I had a play around with Slack's API and I really loved their [API Tester](https://api.slack.com/methods/admin.analytics.getFile/test) feature (This feature can be seen with Google's [API Explorer](https://developers.google.com/apis-explorer) too). This is what I think Vercel's API docs could use.

It would help keep the docs somewhat in-date with API changes, as developers would be able to make a test API call with the required parameters within the doc, and see a realtime response; enabling them to see what is expected with the call, and what to expect as a response. By allowing the dev to select an Endpoint version, it puts emphasis on the idea that the endpoints are versioned, and allows users to see how calls and responses differ between versions. In a nutshell, the test API caller becomes the live documentation; Showing instead of telling.

<br/>

---

<sup id="reference1">[1]</sup> [ProjectFunction](https://projectfunction.io)

<sup id="reference2">[2]</sup> This [website](https://darylcecile.net) was created using Next.js