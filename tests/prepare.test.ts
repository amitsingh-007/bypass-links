import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import packageJson from '../package.json' with { type: 'json' };

test('prepare installs local hooks only when CI is unset, empty, or false', () => {
  const stubDir = mkdtempSync(path.join(tmpdir(), 'bypass-prepare-'));
  try {
    writeFileSync(
      path.join(stubDir, 'lefthook'),
      '#!/bin/sh\nprintf "%s\\n" "$*"\n',
      {
        mode: 0o755,
      }
    );
    for (const ci of [
      undefined,
      '',
      'false',
      '0',
      '1',
      'true',
      'False',
      ' false ',
    ]) {
      const env: NodeJS.ProcessEnv = { ...process.env, PATH: stubDir };
      if (ci === undefined) delete env.CI;
      else env.CI = ci;
      const result = spawnSync('/bin/sh', ['-c', packageJson.scripts.prepare], {
        cwd: stubDir,
        env,
        encoding: 'utf8',
      });
      const expected = ci === undefined || ci === '' || ci === 'false';
      assert.equal(result.status, 0, `CI=${String(ci)}: ${result.stderr}`);
      assert.equal(
        result.stdout,
        expected ? 'install --reset-hooks-path\n' : '',
        `CI=${String(ci)}`
      );
    }
  } finally {
    rmSync(stubDir, { recursive: true, force: true });
  }
});
