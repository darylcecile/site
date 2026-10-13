# Site behavior and verification

## Run and control

- Install dependencies with `bun install --frozen-lockfile`; use Node 24 and Bun 1.3.14 or the versions pinned by the deployment workflow.
- `bun run dev` starts development through Portless. The portfolio is `https://site.darylcecile.localhost`; the project websites use `{jsvm,sakoa,kato,jsql,binzo}.projects.darylcecile.localhost`.
- `PORTLESS=0 bun run dev` starts Vite directly. `bun run preview` serves an existing production build on port 3000.
- Content generation runs before development/build: `scripts/contentBuilder.ts`, then `scripts/feedBuilder.ts`. Generated modules and the route tree are ignored outputs.
- Local Worker secrets use ignored `.dev.vars`. `GITHUB_TOKEN` supports GitHub activity/statistics; local content builds do not require it.
- The Worker uses `ASSETS`, `IMAGES`, and `SITE_CACHE`. Local development uses local binding state. Native cf deploys use the personal `daryl` profile; CI uses the repository API-token secret.

## Repeatable checks

- `groundwork verify content-no-secrets` compiles local content with the token unset and dotenv loading disabled.
- `groundwork verify kato-examples` exercises the reference parser and its bounded display/diagnostic adapter, including malformed and expanding inputs.
- `groundwork verify binzo-examples` checks release matching and command planning against recorded upstream releases.
- `groundwork verify worker-build typecheck worker-dry-run` builds native Cloudflare output, checks application/binding types, and validates the upload configuration. It does not deploy.
- Plans live under `.groundwork/plans/`; pass a plan to `groundwork verify --plan <file>` when tracking a multi-part task. A build result does not prove an interactive behavior.
- Use `groundwork view guide` and `groundwork map product-hosts` to discover the product journeys below. Keep runtime screenshots, request receipts and demo outputs in the active run evidence directory or ignored `.groundwork/tmp/`.

## Product hosts

`src/lib/product-sites.ts` recognizes the five explicit project domains and their named localhost equivalents, including worktree prefixes. `src/lib/current-product.ts` selects the hostname in the matching server/browser environment. `src/routes/index.tsx` loads the selected project; `src/routes/__root.tsx` selects document metadata and page chrome. Local portfolio hosts end in `site.darylcecile.localhost`, while project hosts end in `projects.darylcecile.localhost`, preventing a branch named `kato` from being mistaken for the Kato website.

Starting from a running Portless server or deployed Worker:

1. Load each product hostname at `/` directly and refresh it. Confirm the correct product content is present in SSR HTML and remains correct after hydration.
2. Confirm its title, description, canonical URL, social image and icon identify that product.
3. Follow section anchors and exercise navigation/back behavior. Unknown page paths should produce a 404 for the product rather than portfolio content.
4. Confirm assets, demo workers and WebAssembly files load from that origin. Product engines must be lazy and browser execution must not occur during SSR.
5. Revisit the apex and a note/project/idea route to confirm the portfolio layout and existing navigation still work.

Source recognition is an allowlist; a hostname containing a product name at an unrelated domain must not select that product.

## JSVM product

- Entry: `https://jsvm.darylcecile.net/` or its Portless equivalent.
- Owner: `src/products/jsvm/`.
- Journey: understand the host/guest boundary, select an example, run actual guest code, inspect its result and capabilities, then reset/edit and exercise an error or execution limit.
- Expected: the demo uses the real runtime, reports failures clearly, supports cancellation/reset, and does not freeze the page. Installation and API examples match the referenced release.
- Evidence: actual result/error output, code and selected settings, keyboard operation, desktop/mobile screenshots, and browser request evidence for lazy loading.

## Sakoa product

- Entry: `https://sakoa.darylcecile.net/` or its Portless equivalent.
- Owner: `src/products/sakoa/`.
- Journey: inspect language choices and agent-oriented workflow, switch between examples, and inspect the corresponding compiler/tooling feedback.
- Expected: snippets and diagnostics match the current compiler. Recorded output is identified as recorded output; a demo must not pretend an editable program was compiled when it was not.
- Evidence: source/compiler revision, exercised examples and outputs, interaction screenshots and keyboard behavior.

## Kato product

- Entry: `https://kato.darylcecile.net/` or its Portless equivalent.
- Owner: `src/products/kato/`.
- Journey: select an example, edit the notation, parse/evaluate it, inspect the typed result, introduce an error, and reset.
- Expected: the reference parser drives results and errors; language typing and environment examples match the implementation, with sample values rather than real secrets.
- Evidence: valid and invalid source/output pairs, errors/locations, reset behavior, and narrow/wide screenshots.

## jsql product

- Entry: `https://jsql.darylcecile.net/` or its Portless equivalent.
- Owner: `src/products/jsql/`.
- Journey: edit JSON and SQL, execute a query, inspect the result, try a malformed query/input, and reset or stop a costly query.
- Expected: real SQLite execution and source-backed row/value conventions. Browser-specific implementation details are described accurately; results are not simulated.
- Evidence: known result sets compared with the CLI/reference mapping, syntax/error behavior, execution bounds, keyboard operation and mobile layout.

## Binzo website

- Entry: `https://binzo.darylcecile.net/` or its Portless equivalent.
- Owner: `src/products/binzo/`.
- Journey: open the matcher, select a recorded release and machine, inspect the selected asset or ambiguity, choose an explicit asset when needed, and inspect/copy the command.
- Expected: matching follows the upstream implementation; recorded release data is identified, and the browser preview does not claim to install software. Unsupported platforms and version/update behavior are explained accurately.
- Evidence: upstream matcher comparisons, selected assets/commands, keyboard/reset behavior and narrow/wide screenshots.

## Portless development

- Owner: `package.json`, `vite.config.ts` and the local-development helper/config documented in `README.md`.
- All six named hosts should reach one Vite/Workers process, with the original public hostname available to SSR.
- Verify a Vite HMR WebSocket handshake on the product hosts, browser hydration and assets. The local proxy's existing unrelated routes must continue working.
- On shutdown, registrations owned by this dev process should be cleaned up. Direct development without Portless should still work for the apex.

## Portfolio and image regression journeys

- Exercise `/`, `/notes`, `/projects`, `/ideas`, `/bookmarks`, representative articles, unknown slugs, feeds/search assets, social redirects, and WebFinger.
- Browser flows include search/navigation, project filters, code copying, article/gallery interactions, GitHub/link hover cards, contribution heatmap and embedded tweets.
- Image proxy cases include a same-origin `/og?slug=throwaway-prototypes` URL encoded in `u`, relative OG URLs, local static images, and remote images. A valid proxied OG image should decode as a 600×315 WebP; unknown slugs return 404 and malformed inputs return 400.
- Inspect direct OG PNGs and optimized images as images, not just HTTP status codes. Check both site themes at appropriate desktop/mobile sizes.

## Deployment observations

The main-branch Actions workflow installs, checks the demo examples, builds, typechecks and deploys with native cf. Inspect the specific commit's successful run, then check the live URLs and Worker upload size. New domains are declared in `cloudflare.config.ts`; verify each host after deployment. A dry-run is configuration evidence, not proof of a live domain or functioning demo.
