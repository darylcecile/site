---
name: Sakoa
startYear: 2026
link: https://github.com/darylcecile/sakoa
tokens: [language, tooling]
repo: darylcecile/sakoa
---

Sakoa is a progressive systems and application language I've been designing and implementing from scratch. The pitch I keep coming back to:

> TypeScript's approachability, Rust's safety, Zig's explicitness, Go's simplicity, Swift/Kotlin's ergonomics, and ML-style types where they actually help.

The interesting bits aren't the syntax — that's deliberately boring (braces, no semicolons, types after names, inference everywhere it doesn't hurt). The interesting bits are the choices underneath: a **first-class effect system**, **three memory modes** instead of one borrow checker, a clean **`type` vs `actor` split**, **structured concurrency**, **`parallel for` as an expression**, and a **MIR with multiple backends** (native via C, JS, WebAssembly text, embedded) all driven from one CLI and one compiler that also powers the LSP.

```sakoa
type PaymentStatus =
  | Pending
  | Paid { at: DateTime }
  | Failed { reason: String }
  | Refunded { amount: Money }

fn describe(status: PaymentStatus) -> String {
  match status {
    Pending => "Waiting for payment"
    Paid { at } => "Paid at ${at}"
    Failed { reason } => "Failed: ${reason}"
    Refunded { amount } => "Refunded ${amount}"
  }
}
```

### Effects in the type system

Functions declare what they touch. A pure function has no `uses` clause; anything that talks to the outside world says so on its signature.

```sakoa
fn calculateTax(income: Money) -> Money

fn saveUser(user: User) uses db -> Result<(), DbError>

fn sendEmail(email: Email) uses net, env -> Result<(), EmailError>
```

Effects propagate through call sites and are inferred locally, but become *required* at API and package boundaries — the compiler answers "can this transitively touch the network?" without anyone having to grep. The neat part: effects also apply to property getters, so a field-looking access that secretly hits the database is forced to surface that.

```sakoa
type User = {
  id: UserId

  get avatarUrl uses db -> Url {
    return db.users.avatarUrl(id)
  }
}
```

### Three memory modes, not one borrow checker

Most modern languages pick a single memory model and live with the consequences. Sakoa picks three and lets you opt into the right one per value.

```sakoa
let user = User { id: UserId("1"), name: "Daz", email: "..." }
let buffer = boxed Buffer.withCapacity(4096)
let session = shared Session.new()
```

- **Default** — value semantics with move/copy depending on the type. No annotations, no borrow checker yelling at you for writing a script.
- **`boxed`** — uniquely owned heap value, deterministic drop. Think Rust `Box<T>` without the lifetime ceremony.
- **`shared`** — reference-counted or GC'd depending on backend, used for graph-like app state.
- **`unsafe`** — allowed, but visually fenced and visible in diffs.

Resource lifetimes are explicit too. Owned values get a `drop` block, and ad-hoc resources can be scoped with `using`:

```sakoa
type FileHandle = {
  fd: raw.FileDescriptor

  drop {
    unsafe { raw.close(fd) }
  }
}

using connection = try Database.connect(env.databaseUrl()) {
  try connection.migrate()
  try connection.seed()
}
```

### `type` vs `actor`: data and concurrency are different things

A perpetual frustration with OO-flavoured languages is that "object" is overloaded — sometimes it's data, sometimes it's a concurrency boundary, and you can't tell from the spelling. Sakoa splits them.

```sakoa
type Cart = {
  items: List<CartItem>
}

actor CartStore {
  mut carts: Map<UserId, Cart> = Map.empty()

  fn addItem(userId: UserId, item: CartItem) {
    mut cart = carts.get(userId) ?? Cart { items: [] }
    cart.items.push(item)
    carts[userId] = cart
  }
}
```

A `type` is a value: copy it, move it, serialize it, pattern-match on it. An `actor` is a live concurrency boundary with isolated state and message-passing semantics — crossing it is async at the call site, and data races are impossible in safe code.

```sakoa
let store = CartStore()
await store.addItem(userId, item)
```

### Structured concurrency, parallel-for as an expression

Tasks are scoped. If the parent exits, children are cancelled. There are no orphaned futures sitting around with no parent.

```sakoa
async fn loadDashboard(userId: UserId) -> Dashboard {
  let userTask = task fetchUser(userId)
  let feedTask = task fetchFeed(userId)
  let notesTask = task fetchNotifications(userId)

  return Dashboard {
    user: try await userTask,
    feed: try await feedTask,
    notifications: try await notesTask,
  }
}
```

For data parallelism, `parallel for` is an *expression* that produces ordered results — the ordering is preserved across the parallel scheduler, and shared counters use `std.atomic` so the runtime knows when to apply atomic ops vs ordinary stores.

```sakoa
import std.atomic as atomic

fn main() -> Int {
  let total = atomic.new(0)

  let squares = parallel for value in range(0, 8) where value % 2 == 0 {
    value * value
  }

  parallel for value in range(1, 5) {
    atomic.add(lend total, value)
  }

  println("squares = ${squares.length}, total = ${atomic.load(lend total)}")
  0
}
```

Note `lend total` at the call site — borrowing is visible in the *caller*, not just the callee. You can't accidentally hand out a mutable reference; you have to write the word.

### Tests, properties, and benches are syntax

There's no testing framework to import. `test`, `bench`, and property declarations are language constructs, discovered and run by the same toolchain that builds your code, with deterministic property generation/shrinking and beside-test snapshots.

```sakoa
import std.thread as thread

test "thread worker can be spawned and joined" {
  let spawned = thread.spawn<Int>(countBatch)

  match spawned {
    Ok { value } => {
      let joined = await thread.join(value)
      expect joined == Ok { value: 21 }
    }
    Err { error } => expect false,
  }
}

bench "parallel heavy loop" {
  parallel for value in range(0, 64) { cpuHeavy(value) }.length
}
```

### One compiler, one MIR, four targets

The compiler lowers Sakoa to a typed MIR (mid-level IR) that the test runner *interprets* directly — so `sakoa test` and `sakoa run` execute through the same MIR that the backends consume. There are four artifact contracts:

- **`native`** — generated C plus a compiled executable from the platform C toolchain (no rustc dependency at runtime).
- **`js`** — runnable JavaScript, useful for shipping Sakoa code to the web.
- **`wasm`** — WebAssembly text format, with a clear story for shared-memory and host-import contracts.
- **`embedded`** — a manifest plus C source for embedded toolchains.

Backend diagnostics fail the build *before* writing any artifact when a feature isn't supported on the chosen target. So if your code uses `std.thread` and you ask for `--target wasm`, you get a clean error pointing at the call site, not a half-broken `.wasm` file.

```sh
sakoa build --release counter.sakoa
sakoa build --target wasm examples/wasm
sakoa build --target js --output build/counter.js counter.sakoa
sakoa profile --format json counter.sakoa
sakoa explain E0500
```

The same compiler powers the LSP and VSCode extension, so editor diagnostics, hovers, completions, semantic tokens, and code actions are always exactly what `sakoa check` produces. Nothing drifts.

### Motivation

I've been collecting opinions about programming languages for years and never had a place to actually try them out together. Sakoa is that place: an effect system that doesn't make you annotate everything, three memory modes instead of one, structured concurrency by default, value/actor as a real distinction, deterministic resource cleanup, sum types and pattern matching that pull their weight, and tests/benches/properties as part of the grammar instead of an afterthought library.

The other goal is tooling cohesion. Most languages I love have an LSP that lags the compiler, a formatter that disagrees with the linter, and a package manager whose error messages have nothing to do with anything else. Sakoa is built so a single `sakoa` binary owns the lifecycle — and a single Rust crate is the source of truth for what the language *is*. The CLI, the LSP, the formatter, the test runner, and the docs generator all consume that crate. Nothing can drift, because there's nowhere for it to drift to.
