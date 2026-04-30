---
name: JavaScript Virtual Machine (jsvm) 🐱‍👤
startYear: 2026
link: https://github.com/darylcecile/vmjs
tokens: [web, library, sandbox]
repo: darylcecile/vmjs
---

jsvm is a TypeScript library for creating secure-by-default JavaScript virtual machines, in JavaScript. It runs in the browser as well as on the server, and is intended for applications that need an explicit boundary between host code and guest-authored JavaScript — plugin systems, embedded scripting, untrusted user code, reproducible execution, and similar use cases where worker, iframe, or process isolation isn't enough on its own.

```ts
import { VM, networkRule } from "@catmint-fs/jsvm";

const vm = new VM({
  capabilities: {
    networkingRules: [
      networkRule("example.com")
        .allow({ methods: ["GET"], paths: ["/api/*"] }),
    ],
    executionRules: { timeLimit: 1000 },
    numbers: { randomSeed: "deterministic", dateNow: 1697059200000 },
  },
});

await vm.start();
const result = await vm.eval("1 + 2");
const snapshot = await vm.snapshot();
vm.dispose();
```

Guest source is parsed into an AST with <Abbr title="Acorn" link="https://github.com/acornjs/acorn">Acorn</Abbr> and executed by jsvm's own tree-walking interpreter. It deliberately does **not** use host `eval`, indirect `eval`, `Function`, `AsyncFunction`, or dynamic `import()` to run guest code. The host/guest boundary is serialization-only: initial globals are reconstructed inside the VM, host functions are exposed as revocable capabilities, and `eval()` results, snapshots, and capability arguments are all serialized across the boundary so host object identity, prototypes, accessors, symbols, and shared references never leak into guest land.

<figure className="not-prose my-8">
  <svg viewBox="0 0 720 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram of host and guest boundary in jsvm" className="w-full h-auto" style={{ color: 'currentColor' }}>
    <defs>
      <marker id="vmjs-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
      </marker>
    </defs>

    <rect x="20" y="30" width="300" height="280" rx="10" fill="none" stroke="currentColor" strokeOpacity="0.4" />
    <text x="40" y="55" fontSize="14" fontWeight="600" fill="currentColor">Host (your app)</text>

    <rect x="40" y="75" width="260" height="60" rx="6" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.3" />
    <text x="50" y="95" fontSize="12" fontWeight="600" fill="currentColor">Capabilities</text>
    <text x="50" y="115" fontSize="11" fill="currentColor" fillOpacity="0.75">Network rules · Exec limits</text>
    <text x="50" y="129" fontSize="11" fill="currentColor" fillOpacity="0.75">Globals · RNG seed · Date.now</text>

    <rect x="40" y="150" width="260" height="50" rx="6" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.3" />
    <text x="50" y="170" fontSize="12" fontWeight="600" fill="currentColor">Real fetch / timers / RNG</text>
    <text x="50" y="188" fontSize="11" fill="currentColor" fillOpacity="0.75">Performed by host on guest's behalf</text>

    <rect x="40" y="215" width="260" height="80" rx="6" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.3" />
    <text x="50" y="235" fontSize="12" fontWeight="600" fill="currentColor">Public API</text>
    <text x="50" y="253" fontSize="11" fill="currentColor" fillOpacity="0.75">vm.eval() · vm.import()</text>
    <text x="50" y="269" fontSize="11" fill="currentColor" fillOpacity="0.75">vm.snapshot() · vm.dispose()</text>
    <text x="50" y="285" fontSize="11" fill="currentColor" fillOpacity="0.75">getGlobalFunction()</text>

    <rect x="400" y="30" width="300" height="280" rx="10" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="4 4" />
    <text x="420" y="55" fontSize="14" fontWeight="600" fill="currentColor">Guest VM (jsvm)</text>

    <rect x="420" y="75" width="260" height="50" rx="6" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.3" />
    <text x="430" y="95" fontSize="12" fontWeight="600" fill="currentColor">Acorn parser</text>
    <text x="430" y="113" fontSize="11" fill="currentColor" fillOpacity="0.75">Source → AST (no eval/Function)</text>

    <rect x="420" y="140" width="260" height="60" rx="6" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.3" />
    <text x="430" y="160" fontSize="12" fontWeight="600" fill="currentColor">Tree-walking interpreter</text>
    <text x="430" y="178" fontSize="11" fill="currentColor" fillOpacity="0.75">VM-owned envs · null-proto records</text>
    <text x="430" y="194" fontSize="11" fill="currentColor" fillOpacity="0.75">Cooperative time budget</text>

    <rect x="420" y="215" width="260" height="80" rx="6" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.3" />
    <text x="430" y="235" fontSize="12" fontWeight="600" fill="currentColor">Guest world</text>
    <text x="430" y="253" fontSize="11" fill="currentColor" fillOpacity="0.75">Reconstructed globals</text>
    <text x="430" y="269" fontSize="11" fill="currentColor" fillOpacity="0.75">Wrapped fetch / XHR</text>
    <text x="430" y="285" fontSize="11" fill="currentColor" fillOpacity="0.75">Deterministic Date / Math.random</text>

    <line x1="320" y1="170" x2="400" y2="170" stroke="currentColor" strokeOpacity="0.7" markerEnd="url(#vmjs-arrow)" markerStart="url(#vmjs-arrow)" />
    <text x="360" y="160" fontSize="10" fill="currentColor" fillOpacity="0.75" textAnchor="middle">serialize</text>
    <text x="360" y="186" fontSize="10" fill="currentColor" fillOpacity="0.75" textAnchor="middle">capability calls</text>

    <text x="360" y="320" fontSize="10" fill="currentColor" fillOpacity="0.6" textAnchor="middle">No shared identity, prototypes, accessors, symbols, or refs</text>
  </svg>
  <figcaption className="text-center text-sm text-foreground/60 mt-2">Host and guest only ever exchange serialized values across capability boundaries.</figcaption>
</figure>

### Motivation

I kept hitting variants of the same problem: I wanted to run a bit of user-supplied JavaScript inside a larger JS application — for templating, for plugins, for "bring your own logic" — without giving that code access to the host's globals, network, or timing primitives. The usual answers (workers, iframes, server sandboxes) all add deployment complexity and still leak surprising things.

jsvm is my attempt at a smaller, more honest sandbox. It doesn't claim to replace process or OS-level isolation when you need hard resource guarantees, but it does give you a sharp, capability-based boundary you can reason about: every host function the guest can call is something you explicitly handed it, every network request is matched against rules you declared, and execution time, randomness, and even `Date.now()` can be made deterministic for testing or replay. Building it has also been a fun exercise in understanding how much of "JavaScript" can be implemented in JavaScript without cheating.
