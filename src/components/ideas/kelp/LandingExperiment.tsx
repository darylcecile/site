'use client';

import { useState } from 'react';
import { Experiment, experimentButton, primaryExperimentButton } from '../Experiment';

type TestedCode = { waitSeconds: number; errorMessage: string };

const initialMessage = 'Start by reviewing the three-second fix and testing it with the team’s current code.';

export function LandingExperiment() {
	const [waitSeconds, setWaitSeconds] = useState(3);
	const [teamUpdated, setTeamUpdated] = useState(false);
	const [approvedSeconds, setApprovedSeconds] = useState<number | null>(null);
	const [testedCode, setTestedCode] = useState<TestedCode | null>(null);
	const [accepted, setAccepted] = useState(false);
	const [message, setMessage] = useState(initialMessage);
	const errorMessage = teamUpdated ? 'Please try again' : 'Payment failed';
	const reviewed = approvedSeconds === waitSeconds;
	const tested = testedCode?.waitSeconds === waitSeconds && testedCode.errorMessage === errorMessage;
	const ready = reviewed && tested;

	function reset() {
		setWaitSeconds(3);
		setTeamUpdated(false);
		setApprovedSeconds(null);
		setTestedCode(null);
		setAccepted(false);
		setMessage(initialMessage);
	}

	function acceptFix() {
		if (!ready || accepted) return;
		setAccepted(true);
		setMessage(`The team’s project now waits ${waitSeconds} seconds and shows “${errorMessage}” on an error. That is the combination you tested, with the timeout edit you reviewed.`);
	}

	return (
		<Experiment number="04" title="Is this still the code you tested?" description="Review and test the timeout fix. Then try changing the fix or letting a teammate update the error message before you accept it." kind="Planned feature" onReset={reset}>
			<dl className="grid gap-3 sm:grid-cols-2">
				<div className="rounded-lg border border-border p-4">
					<dt className="text-xs text-muted-foreground">Your proposed fix</dt>
					<dd className="mt-2 text-lg font-medium">Wait {waitSeconds} seconds</dd>
				</div>
				<div className="rounded-lg border border-border p-4">
					<dt className="text-xs text-muted-foreground">The team’s project now</dt>
					<dd className="mt-2">Wait {accepted ? waitSeconds : 1} {accepted ? 'seconds' : 'second'}<br /><span className="text-xs text-muted-foreground">Error message: “{errorMessage}”</span></dd>
				</div>
			</dl>
			<div className="my-4 grid gap-2 text-sm" aria-live="polite" aria-atomic="true">
				<p className="rounded-lg bg-muted/40 px-4 py-3"><strong>Code review:</strong> {reviewed ? `The ${waitSeconds}-second fix is approved.` : approvedSeconds ? `The reviewer approved ${approvedSeconds} seconds. Your ${waitSeconds}-second edit still needs review.` : 'Nobody has approved your fix yet.'}</p>
				<p className="rounded-lg bg-muted/40 px-4 py-3"><strong>Tests:</strong> {tested ? 'Passed for your fix together with the team’s current code.' : testedCode ? `Need to run again. Last tested: ${testedCode.waitSeconds} seconds with “${testedCode.errorMessage}”.` : 'Haven’t been run with your fix yet.'}</p>
			</div>
			<div className="flex flex-wrap gap-2">
				<button type="button" className={experimentButton} disabled={accepted || reviewed} onClick={() => {
					setApprovedSeconds(waitSeconds);
					setMessage(`Your teammate has reviewed and approved the ${waitSeconds}-second fix. You still need passing tests for this fix together with the team’s current code before accepting it.`);
				}}>Approve the {waitSeconds}-second fix</button>
				<button type="button" className={experimentButton} disabled={accepted || tested} onClick={() => {
					setTestedCode({ waitSeconds, errorMessage });
					setMessage(`The tests passed with a ${waitSeconds}-second wait and the error message “${errorMessage}”. This result is about that particular combination of code.`);
				}}>Run tests with the fix</button>
			</div>
			<div className="mt-5 rounded-lg border border-dashed border-border p-4">
				<p className="mb-3 text-xs text-muted-foreground">What if something changes before the team accepts it?</p>
				<div className="flex flex-wrap gap-2">
					<button type="button" className={experimentButton} disabled={accepted || teamUpdated} onClick={() => {
						setTeamUpdated(true);
						setMessage('A teammate changed the error message to “Please try again”. Your timeout fix is unchanged, so its review still counts. Tests now need to cover the fix together with this new error message.');
					}}>Teammate changes the error message</button>
					<button type="button" className={experimentButton} disabled={accepted || waitSeconds === 5} onClick={() => {
						setWaitSeconds(5);
						setMessage('You changed the wait from three seconds to five. A review or test of the three-second fix doesn’t cover this edit. Ask for another review and run the tests again.');
					}}>Change your fix to five seconds</button>
				</div>
			</div>
			<div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
				<button type="button" className={primaryExperimentButton} disabled={!ready || accepted} onClick={acceptFix}>{accepted ? 'Fix accepted' : 'Accept into the team’s project'}</button>
				<span className="text-xs text-muted-foreground">{accepted ? 'Reset to try another order.' : ready ? 'Reviewed and tested. Ready to accept.' : 'Needs approval and tests of the current code.'}</span>
			</div>
			<p role="status" className="mt-4 min-h-20 text-sm leading-7 text-muted-foreground">{message}</p>
			<p className="mt-3 text-xs leading-6 text-muted-foreground">The tests pass in this example, and the edits are assumed to fit together. These buttons illustrate the planned rules; they don’t run real tests.</p>
		</Experiment>
	);
}
