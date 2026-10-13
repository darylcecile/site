import { repository } from './meta';

export const sourceCommit = '52f6800682c659eef8d0c46e81826ce1b9f849c2';
export const sourceUrl = `${repository}/tree/${sourceCommit}`;

export const effectSource = `import std.env as env

fn readMode() -> String {
  env.get("SAKOA_MODE") ?? "local"
}

pub fn mode() uses env -> String {
  readMode()
}`;

type Recording = {
	label: string;
	file: string;
	source: string;
	command: string;
	output: string;
	exitCode: 0 | 1;
	status: string;
	explanation: string;
	lines: number[];
};

type Specimen = {
	id: string;
	label: string;
	question: string;
	docs: string;
	before: Recording;
	after: Recording;
};

// Captured from the unmodified Rust CLI at sourceCommit. These are recorded
// executions of fixed programs, not a browser compiler or a simulated checker.
// Full source and stdout/stderr are retained; command output joins the two streams.
export const specimens: Specimen[] = [
	{
		id: 'effects',
		label: 'Effects',
		question: 'Can a helper hide an environment read?',
		docs: 'docs/effects-async-unsafe.md#effects',
		before: {
			label: 'Missing effect',
			file: 'effects-missing.sakoa',
			source: effectSource.replace(' uses env', ''),
			command: 'sakoa check effects-missing.sakoa',
			output: 'status: checked\nsource: effects-missing.sakoa\nsources: 1\ntokens: 34\nast_items: 3\nsymbols: 2\nhas_main: false\ndiagnostics: 1\n\nerror[E0600]: public function `mode` performs effect `env` but does not declare it\ncommand completed with compiler errors',
			exitCode: 1,
			status: 'E0600 · Missing public effect',
			explanation: 'The environment read travels through a private helper. The checker still requires the public function to expose the env effect.',
			lines: [7],
		},
		after: {
			label: 'Declared effect',
			file: 'effects-declared.sakoa',
			source: effectSource,
			command: 'sakoa check effects-declared.sakoa',
			output: 'status: checked\nsource: effects-declared.sakoa\nsources: 1\ntokens: 36\nast_items: 3\nsymbols: 2\nhas_main: false\ndiagnostics: 0',
			exitCode: 0,
			status: 'Checked · No diagnostics',
			explanation: 'Adding uses env makes the public contract match its behavior. Private helpers can infer effects; public and package-visible functions must declare them.',
			lines: [7],
		},
	},
	{
		id: 'ownership',
		label: 'Ownership',
		question: 'Where does this function borrow your value?',
		docs: 'docs/ownership.md',
		before: {
			label: 'Implicit borrow',
			file: 'borrow-missing.sakoa',
			source: `type Counter = { value: Int }

fn increment(borrow counter: mut Counter) -> Void {
  counter.value += 1
}

fn main() -> Void {
  mut counter = Counter { value: 1 }
  increment(counter)
  println("count: \${counter.value}")
}`,
			command: 'sakoa check borrow-missing.sakoa',
			output: 'status: checked\nsource: borrow-missing.sakoa\ncache: miss\ncache_key: 320b38def5d34c79\ncache_reason: metadata not found\ntokens: 51\nast_items: 3\nsymbols: 3\nhas_main: true\ndiagnostics: 1\n\nerror[E0500]: borrowed parameter `counter` requires `lend` at call site\ncommand completed with compiler errors',
			exitCode: 1,
			status: 'E0500 · Missing lend',
			explanation: 'A borrowed parameter is only half of the agreement. The call site must say lend, making the borrowing operation visible in a review.',
			lines: [9],
		},
		after: {
			label: 'Explicit lend',
			file: 'borrow-explicit.sakoa',
			source: `type Counter = { value: Int }

fn increment(borrow counter: mut Counter) -> Void {
  counter.value += 1
}

fn main() -> Void {
  mut counter = Counter { value: 1 }
  increment(lend counter)
  println("count: \${counter.value}")
}`,
			command: 'sakoa run borrow-explicit.sakoa',
			output: 'count: 2',
			exitCode: 0,
			status: 'Executed · count: 2',
			explanation: 'The caller explicitly lends the mutable counter. This version passes checking and runs through the MIR interpreter, updating the original value.',
			lines: [9],
		},
	},
	{
		id: 'types',
		label: 'Types',
		question: 'What happens when a state goes unhandled?',
		docs: 'docs/language.md#enums',
		before: {
			label: 'Missing case',
			file: 'types-missing.sakoa',
			source: `type Job =
  | Ready
  | Done { count: Int }

fn describe(job: Job) -> String {
  match job {
    Ready => "Waiting"
  }
}`,
			command: 'sakoa check types-missing.sakoa',
			output: 'status: checked\nsource: types-missing.sakoa\ncache: miss\ncache_key: 45d674fa6ae35b6e\ncache_reason: metadata not found\ntokens: 30\nast_items: 2\nsymbols: 2\nhas_main: false\ndiagnostics: 1\n\nerror[E0700]: non-exhaustive match on `Job`; missing Done\ncommand completed with compiler errors',
			exitCode: 1,
			status: 'E0700 · Non-exhaustive match',
			explanation: 'The known enum has two variants, but this match handles only one. The diagnostic names the missing state instead of leaving it implicit.',
			lines: [6, 7, 8],
		},
		after: {
			label: 'Both cases',
			file: 'types-complete.sakoa',
			source: `type Job =
  | Ready
  | Done { count: Int }

fn describe(job: Job) -> String {
  match job {
    Ready => "Waiting"
    Done { count } => "Processed \${count}"
  }
}`,
			command: 'sakoa check types-complete.sakoa',
			output: 'status: checked\nsource: types-complete.sakoa\ncache: miss\ncache_key: 3dffd998e1da5b5d\ncache_reason: metadata not found\ntokens: 36\nast_items: 2\nsymbols: 2\nhas_main: false\ndiagnostics: 0',
			exitCode: 0,
			status: 'Checked · No diagnostics',
			explanation: 'Both variants now have an explicit branch. The Done branch binds its count payload, so the state and its data stay together.',
			lines: [8],
		},
	},
	{
		id: 'tests',
		label: 'Tests',
		question: 'Can a small counterexample explain the bug?',
		docs: 'docs/getting-started.md#5-add-tests-properties-snapshots-and-benchmarks',
		before: {
			label: 'Double the value',
			file: 'tests-failing.sakoa',
			source: `fn square(value: Int) -> Int {
  value * 2
}

test "four squared is sixteen" {
  expect square(4) == 16
}

property "squares are non-negative" {
  forAll value: Int {
    expect square(value) >= 0
  }
}`,
			command: 'sakoa test tests-failing.sakoa',
			output: 'fail test tests-failing.sakoa::four squared is sixteen\n  message: expectation failed: values were not equal\n  actual: 8\n  expected: 16\n  diff:\n    - expected 16\n    + actual   8\nfail property tests-failing.sakoa::squares are non-negative\n  message: expectation failed: comparison `>=` was false\n  left: -366\n  right: 0 (case 1: value = -183; shrunk to value = -1 in 1 steps)\nstatus: tests failed\nfiles: 1\ncache_hits: 1\ncache_misses: 0\ncache_stale: 0\ncache_disabled: 0\ntests: 2\ntest_declarations: 1\nproperty_declarations: 1\nbenchmarks: 0\npassed: 0\nfailed: 2\nskipped: 0\nerrors: 0\ndiagnostics: 0\n\ntest run failed',
			exitCode: 1,
			status: 'Failed · Counterexample: −1',
			explanation: 'Doubling is not squaring. The unit test reports 8 instead of 16; the property runner shrinks its negative input from −183 to −1.',
			lines: [2],
		},
		after: {
			label: 'Square the value',
			file: 'tests-passing.sakoa',
			source: `fn square(value: Int) -> Int {
  value * value
}

test "four squared is sixteen" {
  expect square(4) == 16
}

property "squares are non-negative" {
  forAll value: Int {
    expect square(value) >= 0
  }
}`,
			command: 'sakoa test tests-passing.sakoa',
			output: 'pass test tests-passing.sakoa::four squared is sixteen\npass property tests-passing.sakoa::squares are non-negative\n  message: 32 generated cases\nstatus: tests passed\nfiles: 1\ncache_hits: 1\ncache_misses: 0\ncache_stale: 0\ncache_disabled: 0\ntests: 2\ntest_declarations: 1\nproperty_declarations: 1\nbenchmarks: 0\npassed: 2\nfailed: 0\nskipped: 0\nerrors: 0\ndiagnostics: 0',
			exitCode: 0,
			status: 'Passed · 32 generated cases',
			explanation: 'The corrected implementation passes the unit test and all 32 generated property cases. Tests and properties are language declarations, run by sakoa test.',
			lines: [2],
		},
	},
];
