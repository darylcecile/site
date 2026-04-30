---
name: JavaScript Virtual Machine (jsvm) 🐱‍👤
startYear: 2026
link: https://github.com/darylcecile/vmjs
tokens: [web, library]
repo: darylcecile/vmjs
---

jsvm is a TypeScript library for creating secure-by-default JavaScript virtual machines, in JavaScript. It runs in the browser as well as on the server, and is intended for applications that need an explicit boundary between host code and guest-authored JavaScript — plugin systems, embedded scripting, untrusted user code, reproducible execution, and similar use cases where worker, iframe, or process isolation isn't enough on its own.

Guest source is parsed into an AST with <Abbr title="Acorn" link="https://github.com/acornjs/acorn">Acorn</Abbr> and executed by jsvm's own tree-walking interpreter. It deliberately does **not** use host `eval`, indirect `eval`, `Function`, `AsyncFunction`, or dynamic `import()` to run guest code. The host/guest boundary is serialization-only: initial globals are reconstructed inside the VM, host functions are exposed as revocable capabilities, and `eval()` results, snapshots, and capability arguments are all serialized across the boundary so host object identity, prototypes, accessors, symbols, and shared references never leak into guest land.

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

### Motivation

I kept hitting variants of the same problem: I wanted to run a bit of user-supplied JavaScript inside a larger JS application — for templating, for plugins, for "bring your own logic" — without giving that code access to the host's globals, network, or timing primitives. The usual answers (workers, iframes, server sandboxes) all add deployment complexity and still leak surprising things.

jsvm is my attempt at a smaller, more honest sandbox. It doesn't claim to replace process or OS-level isolation when you need hard resource guarantees, but it does give you a sharp, capability-based boundary you can reason about: every host function the guest can call is something you explicitly handed it, every network request is matched against rules you declared, and execution time, randomness, and even `Date.now()` can be made deterministic for testing or replay. Building it has also been a fun exercise in understanding how much of "JavaScript" can be implemented in JavaScript without cheating.
