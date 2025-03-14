---
title: "useReact: My go-to React Hooks"
date: "2022-02-01"
lastUpdated: "2022-02-25"
snippet: 'Spotlight: My go-to React Hooks'
---

<InfoBox type="warn">
<strong>WIP:</strong> This post is WIP. I plan to continue to update it as my React journey continues. 
</InfoBox>

Two years ago, there was a hype around React; and after a couple of months of trying to avoid 
yet-another-javascript-framework, I gave up and decided to see what all the hype was all about. Since that time, Ive not
looked back.

Fast-forward to today, I've used React (specifically with Next.js) to create over 4 professional sites, and over 7 side
projects. And throughout that time I have created a few custom hooks that I found myself reusing across projects. These
hooks help simplify my flow of data, and give me finer control over my components. These hooks may not be applicable to 
all types of applications, but for the most part they have been super useful for my use-cases:

### UseAsync

I use this hook to control data flow from async methods. This is usually from using third-party libraries, but can be 
useful in other cases:

```typescript jsx
import {useCallback, useEffect, useState} from "react";

export default function useAsync<T>(method: () => Promise<T>, dependencies:Array<any> = []) {
	const methodCaller = useCallback(()=>{
		setError(null);
		setStatus("pending");
		method().then(response => {
			setData(response);
			setStatus("fulfilled");
		}).catch(err => {
			setError(err);
			setStatus("rejected");
		});
	}, [method, ...dependencies]);
	const [data, setData] = useState<T>(null);
	const [status, setStatus] = useState<"fulfilled" | "pending" | "rejected">("pending");
	const [error, setError] = useState<Error>(null);
	
	return {status, data, error, run:methodCaller};
}

// USAGE
function MyComponent(){
	const {data, run, status} = useAsync(()=> fetchMovieDetail('harry potter'));

	return (
		<div>
			<pre>{status === 'fulfilled' && JSON.stringify(data, null, '\t')}</pre>
			<button onClick={run}>{status === 'pending' ? 'Pending' : 'Fetch'}</button>
		</div>
	)
}
```

### UseRender

Occasionally, I find myself needing to interface with third-party libraries and need to control the rendering cycle
manually. React is good at managing rendering cycles in most cases, but in those rare situations like when you are using
third-parties like Monaco, this may come in handy:

```typescript jsx
import {useReducer} from "react";

export default function useRender() {
	const [count, increment] = useReducer(n => n + 1, 0);
	
	return {render:increment}
}
```

### UseEvent

While working on a previous side project, I found myself adding event listeners to dom events on a regular basis, so I
ended up with the following:

```typescript jsx
import {useCallback, useEffect, useState} from "react";

export default function useEvent(element?: EventTarget) {
	const [eventListeners, setEventListeners] = useState<Record<string, ((ev: Event) => void)>>({});
	
	const addEventListener = useCallback((eventName:string, eventHandler)=>{
		setEventListeners(prev => {
			return {
				...prev,
				[eventName]: eventHandler
			}
		});
	}, [eventTarget]);
	const removeEventListener = useCallback((eventName:string)=>{
		setEventListeners(prev => {
			const draft = {...prev};
			delete draft[eventName];
			return draft;
		});
	}, [eventTarget]);

	useEffect(() => {
		const target = element ?? window;
		const listeners = {...eventListeners};
		
		// addListeners
		Object.entries(listeners).forEach(entry => {
			eventTarget.addEventListener(entry[0], entry[1]);
		});
		
		// remove old listeners
		return ()=> {
			Object.entries(listeners).forEach(entry => {
				eventTarget.removeEventListener(entry[0], entry[1]);
			});
		}
	}, [eventListeners]);

	return {
		on:addEventListener,
		off:removeEventListener
	}
}
```

### UseLockScroll

For accessibility-related work, I ended up needing a way to disable scroll lock when a modal component is mounted.

```typescript jsx
import {useLayoutEffect} from "react";

export default function useLockScroll() {
	useLayoutEffect(() => {
		const previous = window.getComputedStyle(document.body).overflow;

		document.body.style.overflow = "hidden";
		
		// undo on unmount
		return () => {
			document.body.style.overflow = previous
		};
	}, []);
}
```

### Note

For now these have been my most used hooks. As my React journey continues, I may update this post to include
new hooks and explain their uses.

✌🏽