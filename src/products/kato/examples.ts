export const referenceCommit = '039aada4fba682c8520e753c76be3eba65c422fa';

export const sampleEnvironment = { MODEL: 'sample-model', REGION: 'eu-west-1' };

export const examples = [
	{
		id: 'agent',
		label: 'Agent config',
		filename: 'assistant.kato',
		description: 'A readable configuration with documentation and advisory agent metadata. Inspect the AST to see what evaluation leaves out.',
		source: `@version 1
@agent {
  purpose: "Configure a research assistant"
  safeToEdit: ["assistant.timeout"]
}

shared { region: env("REGION") }

assistant {
  model: env("MODEL")
  region: ref("shared.region")
  /// Maximum time for one research step.
  timeout: 30s
  streaming: on
  tools: ["search", "read"]
}`,
	},
	{
		id: 'types',
		label: 'Typed values',
		filename: 'values.kato',
		description: 'Compare bare words, reserved literals, and unit values. The AST preserves the distinction between integer, float, and on/off syntax.',
		source: `values {
  answer: yes
  enabled: on
  literal: "on"
  count: 42
  ratio: 1.5
  empty: null
  timeout: 30s
  memory: 512MiB
  rate: 100/min
}`,
	},
	{
		id: 'result',
		label: 'Tool result',
		filename: 'result.kato',
		description: 'An example response a host application could exchange with an agent. Kato supplies the notation; this is not a built-in tool protocol.',
		source: `result {
  tool: "search"
  status: complete
  elapsed: 240ms
  truncated: off
  matches [
    {
      file: "src/config.ts"
      line: 12
      excerpt: "timeout: 30s"
    }
  ]
}`,
	},
	{
		id: 'patch',
		label: 'Review a patch',
		filename: 'review.kato',
		description: 'Switch the evaluation profile to approved, then parse again. The overlay replaces timeout and explicitly adds/removes array items; approval itself belongs to your application.',
		source: `@agent {
  purpose: "Review a proposed config change"
  safeToEdit: ["assistant.timeout", "tools"]
}

assistant { timeout: 30s }
tools: ["search", "debug"]

@profile approved {
  assistant { timeout: 60s }
  tools -= ["debug"]
  tools += ["read"]
}`,
	},
] as const;
