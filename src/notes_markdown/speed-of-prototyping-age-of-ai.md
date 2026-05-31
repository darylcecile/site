---
title: "The Speed of Prototyping in the Age of AI"
date: "2026-05-31"
snippet: How AI has changed the way I prototype, plan, and ship; and what I'm doing to keep my hands dirty.
tags: ["AI", "Productivity", "Prototyping", "Engineering"]
---

<InfoBox type="info">
<strong>Note:</strong> These are personal reflections on how my workflow has shifted over the past year, not a pitch for any tool. Your mileage will (and probably should) vary.
</InfoBox>

A few years back I wrote about my love of [throwaway prototypes](/notes/throwaway-prototypes); those little proof-of-concepts that exist purely to get an idea out of your head and into something tangible. At the time, my biggest bottleneck was _me_; the time it took to scaffold a project, wire up the boring bits, and get to a place where the interesting parts could actually be tested. Fast forward to now, and that bottleneck has all but vanished.

I've been a little hesitant to write about this. I've already shared some [cautious thoughts on AI](/notes/github-copilot-agent-actually-useful-ai) and where it fits into my workflow, and I stand by all of it. I still think the industry is figuring things out in real time, and I still think it pays to be careful. But cautious doesn't mean blind, and the honest truth is that AI has changed how quickly I can go from _"I wonder if…"_ to _"oh, it works"_.

### The recent repos

If you've looked at my [GitHub](https://github.com/darylcecile) recently, you'll have noticed a stream of new repos showing up. [Sakoa](/projects/sakoa), a progressive systems language I've been designing from scratch, complete with an effect system, three memory modes, and a MIR with multiple backends. [Kato](/projects/kato), a notation language meant to sit somewhere between JSON, TOML, and YAML, but explicitly designed to be friendly to both humans and agents. [Seal](/projects/seal), a tiny CLI that quietly kills the `.env` file by stashing secrets in OS-native credential stores. [Karabiner](/projects/karabiner-app), an iOS-first agent-native messaging app. [Plim](/projects/plim), a Notion-inspired, embeddable block editor for the web with a framework-agnostic core and React bindings. And a few more knocking around that aren't ready for the spotlight yet.

A few years ago, that list would have been three repos with READMEs, two abandoned branches, and one working prototype I'd be quietly proud of. Now? The prototypes _exist_. They run. Some of them have tests. A couple are starting to look like real projects. And while not all of them will turn into anything serious (and that's [kind of the point](/notes/throwaway-prototypes)), there is something really satisfying about being able to actually _try_ an idea, rather than just talk about it.

### Zooming out

The thing nobody really warned me about is how much AI changes the _shape_ of engineering work, not just the speed of it. When I'm not the one typing every line, I'm forced to think differently. I'm thinking about boundaries, contracts, and how the pieces fit together. I'm writing prompts and specs that describe the system holistically, before the system exists.

That shift sounds small but it's been quietly transformative. I'm planning at a more abstracted level, framing problems before I solve them, and I've gotten noticeably better at delegating; both to agents _and_ to people. Turns out that the skill of "describing exactly what success looks like, in a way that a junior engineer (or a model) can act on without you in the room" is the same skill in both directions. Sharing vision, breaking work down, anticipating where things might go wrong; these are muscles I've been forced to exercise much more deliberately, and I'm better for it.

### On productivity

I've been tracking this loosely for a while, mostly out of curiosity. Based on my own day-to-day engineering tasks (measured roughly by time-to-PR for typical pieces of work), I'm averaging about _**4x faster**_ than I was before agents became a meaningful part of my workflow. Some days it's more, some days it's less, and some days the agent does something delightfully strange that costs me an hour to undo (which I'll happily count against the average).

But that number understates the more interesting effect: the _kind_ of work I can take on has changed. Things I would have previously parked under "nice idea, no time" now slot into an afternoon. Refactors I would have winced at are doable. The cost of trying something has dropped enough that I'll just try things I'd otherwise have argued about in a doc.

### The cost of speed

It's not all upside. The same velocity that makes me productive also means I'm typing _less_ code than I used to, and I've noticed I have to be deliberate about keeping my own technical dexterity sharp. If I let it, the tools will happily do _all_ of it; and that's not really a deal I want to make. I still want to know how the things I work on actually work.

So I've started carving out time for the manual bits on purpose. Implementing something end-to-end by hand. Reading source code instead of asking for a summary. Sitting with a debugger instead of pasting a stack trace into a chat. It's slower, sometimes frustrating, and probably necessary; both for my own sanity, and because the moments where AI _isn't_ enough still call for an engineer who actually knows what they're doing.

The flip side of this is much more enjoyable: with the new velocity, it's surprisingly easy to carve out time for exploration, learning, and prototyping. The hours I used to spend on the unavoidable middle bits of a project are now freed up to play with new ideas, dig into things I don't fully understand, or just build something weird for the sake of it. That's a trade I'm happy to make.

### Impact at work

This new pace has shown up in my [day job](/notes/committing-to-change) too. Without going into too much detail (I'll save the proper write-ups for once I've got the appropriate sign-off), the velocity boost has let me make impact in a few different areas of my role that I wouldn't have had the bandwidth to touch otherwise:

- I've been able to help bring up some automation that provides support to other engineers; a piece of work I'm genuinely proud of, and one I hope to write about properly soon.
- I've also been digging into our internal codespace bootstrap times and have managed to land changes that cut them down by roughly **~50%**. There's a longer post in me about how we got there, but it'll have to wait.

Both of those are the kind of thing I probably would have had ideas about a couple of years ago but wouldn't have had the headroom to actually deliver alongside my core work. The change in velocity doesn't just speed up the things I was already doing; it expands the surface area of what I can do at all.

### I'm not the only one noticing this

A few other engineers in the field have been writing about similar shifts, and it's been reassuring (and helpful) to read along. Two I'd particularly recommend:

- [Mike McQuaid](https://mikemcquaid.com/sandboxed-agent-worktrees-my-coding-and-ai-setup-in-2026/) (Homebrew lead, ex-Hubber of 10 years) has a great write-up on his current agentic setup, including his use of sandboxing and git worktrees to actually parallelise work. His framing of "more tokens/spend directly translates to more velocity" is one of the clearer articulations of where things are heading.
- [Cassidy Williams](https://cassidoo.co/post/logitech-elgato-holding-hands/), a current Hubber, has been doing a lot of small but very satisfying personal projects with the Copilot CLI, including a fun little setup that wires her Logitech MX Creative Console up to control her Elgato lights. It's a nice example of just how low the bar for _'I'll just build this myself'_ has gotten.

I'd also nod at [Simon Willison's superpowers post](https://simonwillison.net/2025/Oct/10/superpowers/) for a broader look at what coding agents are actually capable of in the wild; well worth a read if you haven't.

<hr />

I still don't think AI is magic, and I'm still cautious about the broader picture; the [environmental, financial, and social](/notes/github-copilot-agent-actually-useful-ai) questions haven't gone anywhere. But for me, right now, the day-to-day reality is that I can move faster, think bigger, and ship more than I could before. And that's been genuinely fun.

I don't have a neat conclusion to wrap this up with. I'm just going to keep prototyping, keep getting my hands dirty when I need to, and keep paying attention to what changes and what doesn't. More thoughts as things continue to shift.

Until next time… ✌🏽

