export const ENGINE_VERSION = '0.2.0';
export const SOURCE_LIMIT = 8_000;
export const EXECUTION_LIMIT = 250;
export const WORKER_LIMIT = 2_000;
export const LOAD_LIMIT = 12_000;
export const RANDOM_SEED = 'issue-triage';
export const FIXED_NOW = 1_760_400_000_000;

export function createIssues() {
	return [
		{ id: 101, title: 'Search loses keyboard focus', priority: 'high', area: 'interface' },
		{ id: 102, title: 'Webhook retries duplicate events', priority: 'high', area: 'api' },
		{ id: 103, title: 'Update the setup guide', priority: 'low', area: 'docs' },
	];
}

export const examples = [
	{
		id: 'triage',
		name: 'Triage data',
		description: 'An agent writes a small transform. The host supplies a copy of three issues; the guest returns a routing plan.',
		source: `// issues is a cloned host-provided value.
const actions = issues
  .filter(issue => issue.priority === "high")
  .map(issue => ({
    id: issue.id,
    team: issue.area === "api" ? "backend" : "frontend",
    action: "review"
  }));

({ actions, count: actions.length });`,
	},
	{
		id: 'capability',
		name: 'Call a tool',
		description: 'Call one explicitly supplied, read-only tool. Changing its returned copy does not change the host fixture; the second call proves it.',
		source: `// This tool reads local fixtures, not a real API.
(async () => {
  const issue = await tools.getIssue(102);
  issue.priority = "low";

  const original = await tools.getIssue(102);
  return {
    title: issue.title,
    guestCopy: issue.priority,
    hostValue: original.priority
  };
})();`,
	},
	{
		id: 'replay',
		name: 'Repeat a run',
		description: 'Each run starts a fresh VM with the same seed and fixed Date.now(). Run it twice: this example returns the same values.',
		source: `// The host controls these two sources of variation.
const sample = [
  Math.random(),
  Math.random(),
  Math.random()
];

({
  timestamp: Date.now(),
  sample,
  bucket: Math.floor(sample[0] * 100)
});`,
	},
	{
		id: 'network',
		name: 'Deny a request',
		description: 'This example intentionally returns VM_SECURITY_ERROR. The VM-owned fetch checks the empty network policy before a host request can happen.',
		source: `// A fetch binding is not permission to use the network.
// No networkingRules are granted in this workbench.
fetch("https://example.com/private");`,
	},
	{
		id: 'timeout',
		name: 'Stop a loop',
		description: 'This example intentionally returns VM_TIMEOUT_ERROR at an interpreter checkpoint. A separate worker-termination timer backs up the cooperative guard.',
		source: `// Deliberately exceeds the 250 ms interpreter guard.
while (true) {
  // The interpreter checks its budget as it evaluates.
}`,
	},
] as const;

export type DemoReply =
	| { type: 'ready' }
	| { type: 'result'; ok: boolean; output: string; calls: string[]; elapsed: number; code?: string };

export type DemoState = {
	status: 'idle' | 'loading' | 'running' | 'complete' | 'error' | 'stopped';
	message: string;
	result?: Extract<DemoReply, { type: 'result' }>;
};

export const initialDemoState: DemoState = {
	status: 'idle',
	message: 'Ready when you are. Run the code to see a real result.',
};
