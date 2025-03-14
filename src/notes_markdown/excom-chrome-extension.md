---
title: "Exploring the Chrome Extension context gaps"
date: "2022-06-04"
snippet: 'Spotlight: Chrome extension Tool'
---

A couple of weeks ago, a conversation at work with my manager prompted me to revisit an old chrome extension I created a while
back to help me manage my tab usage better.

The extension was born out of frustration for tab management; I was simply out of control.
A simple workday could easily land me with 50+ tabs. So I created an extension called [Alfred](https://chrome.google.com/webstore/detail/alfred/mjlmoifgncbednjccpnhcjeifpfnjeon)
that would automatically close tabs that I hadn't used in a while. The experience was not something I enjoyed... or wanted to repeat. So I pushed that side-project aside like a typical developer
and avoided going back to it.

Fast-forward to the conversation with my manager, I realised it was time to give Chrome extension development another shot. This time,
I had another motive; I wanted to prove that developing a Chrome extension using [React](https://reactjs.org/), 
[TypeScript](https://typescriptlang.org/), and [esbuild](https://esbuild.github.io/) could make the development
process enjoyable.

So I set off creating a folder to house my project, and `yarn add`-ed esbuild, typescript, and react. I had a rough idea
of what I wanted; react for the content script (to inject into the page), and esbuild to transpile and bundle my .tsx into .js that
Chrome could consume directly. I started to plan down what I would make my extension do, and remembered why I didn't enjoy developing
extensions - runtime realms. 

Chrome's extension [runtime](https://developer.chrome.com/docs/extensions/mv3/architecture-overview/#arch) is essentially 
split into three 'realms' (I'm not sure if this is the correct name for it, but this is my post, so I'll call it that going 
forward); the content script, the background script, and the popup. (I know chrome also allows for new tab pages and the like, 
but from my _limited_ experience these act more or less like popups). Due to the sandboxing
nature and the way the extension-land is set up, most cross-realm communication need to take place 
via [message passing](https://developer.chrome.com/docs/extensions/mv3/messaging/). So one realm needs to send, and 
the receiving end needs to have a listener set up to respond to the messages. This is all fine and understandable, but when you look deeper
it becomes clear that the three realms don't behave the same way and don't have the same lifecycle steps. Now this is what annoyed me, 
because as the developer, I had to manage not only the communication between the realms, but the fact that they are all in their own separate
contexts. Surely there was something I could do to bridge this gap and abstract it behind an api that would handle that for me?

![Extensions Architecture as seen on developer.chrome.com](/images/chrome-extension-architecture.png)

I started by thinking of a simple (probably useless) scenario. I'd have the content-script injecting a React component with a simple
counter state. Then I should be able to update the state from the extension popup by calling the same function as the content-script - 
all without having to think about messaging and listeners. And to be extra spicy, be able to trigger a 'open new tab' function that lives
in the background-script, from both the content-script and the popup.

First thing was to create a class that would handle the communication itself between realm boundaries, making sure to handle function calls
from different realms first. I didn't want to make every function in a realm accessible to other realms, so I added a `registerInterfaces(...)`
method that would allow you to expose specific functions to other realms. This would then become accessible on that realm's script instance.
After this I had to make sure that the incoming-messages listeners where set up, so I moved that to a `tap()` method that should be called
to set up the listeners. This was mostly done to satisfy my future react-related use-case where I'd need to be able to `untap()` to clean up
in `useEffect(...)` calls.

After some playing about and end-to-end user-testing, I ended up with something that completed my initial plan, so 
I [published](https://www.npmjs.com/package/@projectfunction/excom). Now I can have a handler in any realm, and easily 
send messages and call exposed functions in other realms without having to think too hard about messaging and checking each message. 
Instead, I can do this:

```typescript
// In my background.ts
import {backgroundScriptHandler} from "@projectfunction/excom";

backgroundScriptHandler.tap();

backgroundScriptHandler.registerInterfaces({
	openTab: async function(url){
		let tab = await chrome.tabs.create({ url, active: false });
		console.log(`opened tab with id ${tab.id}, from background script`);
		return 25;
	}
});
```

and then in my content-script or popup, I can do:

```typescript
import {popupScriptHandler} from "@projectfunction/excom";

popupScriptHandler.tap(); //somewhere at the start so it runs once

const returnValue = await popupScriptHandler.backgroundMethods.openTab('https://youtube.com');

// returnValue is 25
```

Once this was made and published<sup>[[1]](#reference1)</sup>, I decided to create a dummy extension
that allows me to search through my open tabs through a search box that is injected on any page I'm on, with the background script
handling the actual search and filtering. The experience was so much nicer; I could focus purely on calling methods and UI, and the library
did the rest.

Who knows where this may lead me? Maybe I'll become a full-time extensions developer 😏

--

P.S. I am aware there may be other ways to tackle this and that this potentially has flaws that I am too tired to look into, but this
little exploration was worth it - and if anything, it was just the push I needed to get into extensions.

---

<sup id="reference1">[1]</sup> [Excom Repository](https://github.com/daryl-cecile/excom)