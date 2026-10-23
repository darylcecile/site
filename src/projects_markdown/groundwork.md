---
name: Groundwork
startYear: 2026
link: https://groundwork.darylcecile.net
image: https://groundwork.darylcecile.net/og
tokens: [tooling]
repo: darylcecile/groundwork
---

Groundwork is my framework for delegating work to coding agents, then coming back to a verification report and inspectable proof instead of supervising every step.

## Why I built it

As I used agents for more of my development work, I found myself constantly checking whether they were doing the right thing. Every context switch meant rebuilding my understanding of the task and what the agent had done. The mental load became overwhelming, and I was burning out.

I took a step back and built a framework around verification and trust. I wanted to set an agent off on a task, step away, and have a clear way to assess the result when I returned.

## A process I can trust

Groundwork connects the request to the evidence behind the finished work:

- **Behaviour mapping** records how a feature works and where to verify it.
- **Task tracking** keeps the intended outcome, constraints and definition of done together.
- **Project-owned checks and guardrails** make important requirements executable.
- **Verification** exercises the behaviour and retains observations.
- **Reports and artifacts** show what was verified, what failed and what still needs attention, with proof I can inspect.

I come back to the agent's handoff, the verification report and artifacts such as screenshots. I can assess the outcome without reconstructing the whole transcript or reading every line of output and every diff just to work out what happened.

> Because I trust the framework, I don't need to trust the agent.

The [Groundwork website](https://groundwork.darylcecile.net) walks through an illustrated handoff backed by a real recorded check, with a runnable example and setup instructions.
