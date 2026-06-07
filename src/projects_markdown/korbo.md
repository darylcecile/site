---
name: Korbo
startYear: 2026
link: https://github.com/darylcecile/Korbo
image: screenshots/korbo.png
tokens: [mobile, ios]
repo: darylcecile/Korbo
---

Korbo is a native, touch-first iPad client for [opencode](https://github.com/anomalyco/opencode), the open-source AI coding agent. Think of it as "openchamber for iPad". It doesn't run the agent itself; instead it talks to a remote or LAN `opencode serve` instance over REST, SSE, and WebSocket, and gives you the familiar three-pane workspace: sessions, conversation, and your git/files/context all in one place.

Built in <Abbr title="SwiftUI" link="https://developer.apple.com/xcode/swiftui">SwiftUI</Abbr> and targeting iPad (iOS 17+), the project is currently an early scaffold. The app builds and renders the three-pane shell, and i'm working through the networking layer and feature parity with the opencode GUI from there. The Xcode project is generated with [XcodeGen](https://github.com/yonaskolb/XcodeGen) from a `project.yml` spec, so the source of truth stays in version control rather than in a hand-edited `.xcodeproj`.

### Motivation

I do a lot of my agentic coding through opencode, but i kept wishing i could pick things up from my iPad when i was away from my desk. The existing options never felt quite right on a touchscreen, so i started building the client i actually wanted to use: something native, fast, and designed around the iPad rather than a desktop layout squeezed onto a tablet. Since opencode already runs as a server you control, all Korbo has to do is be a really good front-end for it, which is a fun and well-scoped problem to chip away at.
