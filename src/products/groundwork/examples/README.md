# Groundwork theme example

A synthetic CLI app and a real process-persistence check. Requires Bun, Git, Bash and an installed Groundwork CLI. No dependencies or network requests. The example does not render a user interface.

From the extracted `groundwork-theme-example` directory:

```sh
git init
groundwork verify theme-persists --plan .groundwork/plans/task.json
groundwork view report
```

The driver launches the app twice: set `dark`, then read in a fresh process. Inspect `.groundwork/runs/<id>/theme-persists/artifacts/after-restart.json` and the saved output log. Expected CLI outcome: passed (exit 0). No Git commit is necessary; the report records an uncommitted source fingerprint.

To reproduce a failure, change `JSON.stringify({ theme })` in `preferences.mjs` to `JSON.stringify({ theme: 'light' })`, then run the same check. It should read `light`, fail its assertion and exit 1. Restore the original line and rerun to verify the fix.

To expose a coverage gap, add a second requirement to the plan:

```json
{ "id": "render-theme", "expect": "The restarted screen visibly uses the selected dark theme" }
```

The persistence check still passes, but the second requirement is unverified and the CLI exits 2 (inconclusive). This app has no UI; it cannot establish that claim. In a real application, exercise and inspect its rendered screen, then bind only a check that actually asserts that requirement.

After a passing run, edit `preferences.mjs` and use `groundwork view report`. It detects the changed source without rerunning the check and reports inconclusive. The saved observation is historical; rerun to observe the new source.

This fixture was recorded using Groundwork public-main revision b5c89c4d34421f2442ce176000f86b63c0e5bced. It is an educational example, not a platform compatibility test or a baseline comparison.
