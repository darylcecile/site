#!/usr/bin/env python3
"""Record the synthetic Groundwork journey and pack its canonical example files."""

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from zipfile import BadZipFile, ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[2]
PRODUCT = ROOT / 'src/products/groundwork'
EXAMPLES = PRODUCT / 'examples'
RECORDING = PRODUCT / 'recording/runs.json'
REVISION = 'b5c89c4d34421f2442ce176000f86b63c0e5bced'
FILES = {
    'preferences.mjs': 'preferences.mjs',
    'theme-check.mjs': '.groundwork/scripts/theme-check.mjs',
    'verify.json': '.groundwork/verify.json',
    'task.json': '.groundwork/plans/task.json',
    'README.md': 'README.md',
}
IGNORE = b'runs/\nlatest\nplans/\ntasks/\ntmp/\n'


def command(args, cwd):
    return subprocess.run(args, cwd=cwd, text=True, capture_output=True, check=True).stdout.strip()


def hashes():
    return {name: hashlib.sha256((EXAMPLES / name).read_bytes()).hexdigest() for name in FILES}


def archive_contents():
    files = {target: (EXAMPLES / name).read_bytes() for name, target in FILES.items()}
    return {**files, '.groundwork/.gitignore': IGNORE}


def check():
    recorded = json.loads(RECORDING.read_text())
    if recorded.get('exampleFiles') != hashes():
        raise ValueError('Example sources differ from the recording. Regenerate with --record <pinned-checkout>.')
    with ZipFile(EXAMPLES / 'groundwork-theme-example.zip') as archive:
        expected = {'groundwork-theme-example/' + path: data for path, data in archive_contents().items()}
        if set(archive.namelist()) != set(expected) or any(archive.read(path) != data for path, data in expected.items()):
            raise ValueError('The example ZIP differs from its sources. Regenerate with --record <pinned-checkout>.')
    print('Groundwork example sources, recorded input hashes and ZIP agree.')


def capture(cli, fixture, name, args, expected_code):
    # The CLI resolves a cwd inside .groundwork to its own project root. Enter
    # this fixture's namespace so a containing project's namespace is not used.
    actual_args = ['plans/task.json' if arg == '.groundwork/plans/task.json' else arg for arg in args]
    run = subprocess.run(['bun', str(cli), *actual_args], cwd=fixture / '.groundwork', text=True, capture_output=True)
    output = (run.stdout + run.stderr).strip()
    if run.returncode != expected_code:
        raise ValueError(f'{name}: expected exit {expected_code}, got {run.returncode}\n{output}')
    run_id = (fixture / '.groundwork/latest').read_text().strip()
    directory = fixture / '.groundwork/runs' / run_id
    report = json.loads((directory / 'result.json').read_text())
    observation = report['observations'][0]
    evidence_path = observation['evidence'][0]['path']
    (fixture.parent / f'{name}.txt').write_text(output + '\n')
    return {
        'id': name, 'command': 'groundwork ' + ' '.join(args), 'exitCode': run.returncode,
        'runId': run_id, 'output': output, 'evidencePath': evidence_path,
        'evidence': (directory / evidence_path).read_text().strip(),
        'log': (directory / report['checks'][0]['log']).read_text().strip(),
        'source': report['source'], 'coverage': report['coverage'],
        'observation': observation['observed'], 'context': report['context'],
    }


def record(checkout):
    checkout = checkout.resolve()
    if command(['git', 'rev-parse', 'HEAD'], checkout) != REVISION:
        raise ValueError(f'Use a Groundwork checkout at {REVISION}.')
    command(['git', 'diff', '--exit-code', 'HEAD', '--', 'lib', 'skills', 'package.json'], checkout)
    cli = checkout / 'skills/verify-work/verify.mjs'
    scratch = ROOT / '.groundwork/tmp/groundwork-site/regeneration'
    scratch.mkdir(parents=True, exist_ok=True)
    evidence = Path(tempfile.mkdtemp(prefix='capture-', dir=scratch))
    fixture = evidence / 'fixture'
    for path, content in archive_contents().items():
        target = fixture / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
    command(['git', 'init', '--quiet'], fixture)
    fixed = (EXAMPLES / 'preferences.mjs').read_text()
    if fixed.count('JSON.stringify({ theme })') != 1:
        raise ValueError('Update the recorder’s deliberate light-theme mutation to match the example app.')
    verify = ['verify', 'theme-persists', '--plan', '.groundwork/plans/task.json']
    app = fixture / 'preferences.mjs'
    records = []
    app.write_text(fixed.replace('JSON.stringify({ theme })', "JSON.stringify({ theme: 'light' })"))
    records.append(capture(cli, fixture, 'failure', verify, 1))
    app.write_text(fixed)
    records.append(capture(cli, fixture, 'fixed', verify, 0))
    app.write_text(fixed + '\n// A source edit after the recorded run.\n')
    records.append(capture(cli, fixture, 'stale', ['view', 'report'], 2))
    app.write_text(fixed)
    plan = json.loads((EXAMPLES / 'task.json').read_text())
    plan['requirements'].append({'id': 'render-theme', 'expect': 'The restarted screen visibly uses the selected dark theme'})
    (fixture / '.groundwork/plans/task.json').write_text(json.dumps(plan, indent=2))
    records.append(capture(cli, fixture, 'coverage', verify, 2))
    recorded = {
        'cliRevision': REVISION, 'recordedAt': datetime.now(timezone.utc).isoformat(),
        'bun': command(['bun', '--version'], ROOT), 'exampleFiles': hashes(), 'records': records,
    }
    if RECORDING.exists():
        shutil.copyfile(RECORDING, evidence / 'previous-runs.json')
    RECORDING.write_text(json.dumps(recorded, ensure_ascii=False, indent=2) + '\n')
    with ZipFile(EXAMPLES / 'groundwork-theme-example.zip', 'w', ZIP_DEFLATED) as archive:
        for path, content in archive_contents().items():
            archive.writestr('groundwork-theme-example/' + path, content)
    check()
    print(f'Actual CLI outputs and trial artifacts retained at {evidence.relative_to(ROOT)}')
    print(', '.join(f"{item['id']}: exit {item['exitCode']}" for item in records))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--record', type=Path, metavar='CHECKOUT', help='Run the pinned CLI, then refresh recordings and ZIP.')
    mode.add_argument('--check', action='store_true', help='Check source/recording/ZIP agreement without running the CLI.')
    args = parser.parse_args()
    try:
        record(args.record) if args.record else check()
    except (OSError, ValueError, KeyError, BadZipFile, subprocess.CalledProcessError) as error:
        parser.exit(1, f'{error}\n')
