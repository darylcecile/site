---
name: gosh
startYear: 2026
link: https://github.com/darylcecile/gosh
tokens: [library, sandbox]
repo: darylcecile/gosh
---

gosh is a sandboxed, in-memory Bash interpreter for <Abbr title="Go" link="https://go.dev">Go</Abbr>, built specifically for AI agents. It runs untrusted, model-generated shell scripts inside a fully virtualized environment (built on top of [`mvdan.cc/sh`](https://pkg.go.dev/mvdan.cc/sh/v3)) where no real process is ever spawned and no real file is ever touched unless you explicitly opt in. It ships around 70 sandboxed coreutils (`cat`, `ls`, `grep`, `sed`, `awk`, `jq`, `tar`, `curl`, and friends), a deterministic virtual clock, hard resource limits, and a small, stable API for embedding and extending it.

```go
sh := std.Shell()                       // secure defaults, full command set
res, _ := sh.Run(ctx, `echo "hi $USER" | tr a-z A-Z`)
fmt.Print(res.Stdout)                    // HI
```

The whole thing is fail-closed by design. Everything dangerous (the filesystem, host environment, network egress, process execution) is off until you hand it over, so the same script produces the same output every time until you decide otherwise. Non-zero exit codes are treated as normal shell behaviour, while host-level problems surface as typed errors (`*LimitError`, `*CanceledError`, `*ParseError`, and so on) you can match with `errors.As`. There's also a reference CLI and a `goshmcp` <Abbr title="Model Context Protocol" link="https://modelcontextprotocol.io">MCP</Abbr> server that exposes the sandbox as a single `bash` tool, plus an adversarial test and fuzz suite backing the [threat model](https://github.com/darylcecile/gosh/blob/main/THREAT_MODEL.md).

### Motivation

AI agents really want a shell, but giving a model a real one is basically handing it remote code execution on your machine. I kept running into that tension while building agent tooling, so gosh is my answer to it: give the model a *believable* shell whose every capability is a host decision rather than a default. It pairs nicely with the same line of thinking behind [jsvm](/projects/vmjs), just aimed at bash instead of JavaScript. The fun part has been seeing how much of a genuinely useful shell you can reimplement in pure Go without ever touching `os/exec` or the real disk.
