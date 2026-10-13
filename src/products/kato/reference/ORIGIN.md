# Kato reference implementation

These four TypeScript files are unmodified copies from
[`darylcecile/kato/parsers/ts/src`](https://github.com/darylcecile/kato/tree/039aada4fba682c8520e753c76be3eba65c422fa/parsers/ts/src)
at commit `039aada4fba682c8520e753c76be3eba65c422fa` (retrieved 2026-10-13).

- `parser.ts`, `evaluate.ts`, `types.ts`, `index.ts`
- Source package metadata: `@kato/parser`, version `0.1.0`.
- npm registry returned 404 for this package; GitHub listed no releases.
- Upstream root README license status: **TBD**. No license file or license header
  was present for this parser. This copy does not assert an MIT license.
- Existing source comments are preserved. Treat these files as a read-only
  snapshot; make playground adapters outside this directory.

The Kato playground runs the reference parser/evaluator in a fresh browser
Worker per request. The wrapper supplies only explicitly displayed fixture
environment values and preserves parse and evaluation errors separately.
No source is sent to a server, and no resolver reads the host environment.
