/* eslint-disable no-await-in-loop -- A conflicting record must stop later writes. */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { loadRootEnv } from '@bypass/configs/env';
import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { z } from 'zod/mini';

// Direct Node execution needs the pure module's explicit file extension.
import { encodeText } from '../../../shared/src/utils/codec.ts';

const keepCached = () => {};

const { values } = parseArgs({
  options: {
    project: { type: 'string' },
    plan: { type: 'string' },
    'dry-run': { type: 'boolean' },
    apply: { type: 'boolean', default: false },
  },
});
if (
  !['dev', 'prod'].includes(values.project ?? '') ||
  !values.plan ||
  (values.apply && values['dry-run'])
) {
  throw new Error(
    'Usage: node packages/trpc/src/scripts/migrate-text-codec.ts --project dev|prod --plan /absolute/path.json [--dry-run|--apply]'
  );
}

const changeSchema = z.object({
  path: z
    .string()
    .check(
      z.regex(
        /^data\/[^/.#$[\]]+\/(?:persons\/[^/.#$[\]]+|bookmarks\/folderList\/[^/.#$[\]]+)\/name$/
      )
    ),
  before: z.string(),
  after: z.string(),
});
const planSchema = z.object({
  projectId: z.string(),
  changes: z.array(changeSchema),
});
const config = getFirebasePublicConfig(values.project === 'prod');
loadRootEnv();
const account = z
  .object({
    project_id: z.string(),
    private_key: z.string(),
    client_email: z.string(),
  })
  .parse(
    JSON.parse(atob(z.string().parse(process.env.FIREBASE_SERVICE_ACCOUNT)))
  );
if (account.project_id !== config.projectId) {
  throw new Error(
    `Credentials belong to ${account.project_id}, expected ${config.projectId}`
  );
}
const app = initializeApp({
  credential: cert({
    projectId: account.project_id,
    privateKey: account.private_key,
    clientEmail: account.client_email,
  }),
  databaseURL: config.databaseURL,
});

try {
  const database = getDatabase(app);
  if (values.apply) {
    const plan = planSchema.parse(
      JSON.parse(readFileSync(values.plan, 'utf8'))
    );
    if (plan.projectId !== config.projectId) {
      throw new Error(
        `Plan belongs to ${plan.projectId}, expected ${config.projectId}`
      );
    }
    for (const change of plan.changes) {
      const original = atob(change.before);
      if (!original.includes('%') || change.after !== encodeText(original)) {
        throw new Error(`Invalid legacy-name rewrite at ${change.path}`);
      }
      const ref = database.ref(change.path);
      // Keep the read cached so the transaction does not start with an unknown null.
      ref.on('value', keepCached);
      let result;
      try {
        await ref.once('value');
        result = await ref.transaction(
          (current) => (current === change.before ? change.after : undefined),
          undefined,
          false
        );
      } finally {
        ref.off('value', keepCached);
      }
      if (!result.committed && result.snapshot.val() !== change.after) {
        throw new Error(
          `Value changed since the dry run at ${change.path}; stopped without overwriting it`
        );
      }
      console.log(
        JSON.stringify({
          ...change,
          status: result.committed ? 'rewritten' : 'already-applied',
        })
      );
    }
    console.log(
      `Applied plan for ${config.projectId}: ${plan.changes.length} names`
    );
  } else {
    const changes: z.infer<typeof changeSchema>[] = [];
    const data = await database.ref('data').once('value');
    data.forEach((user) => {
      for (const collection of ['persons', 'bookmarks/folderList']) {
        user.child(collection).forEach((record) => {
          const before = z.string().parse(record.child('name').val());
          const original = atob(before);
          if (original.includes('%')) {
            const change = changeSchema.parse({
              path: `data/${user.key}/${collection}/${record.key}/name`,
              before,
              after: encodeText(original),
            });
            changes.push(change);
            console.log(JSON.stringify(change));
          }
        });
      }
    });
    writeFileSync(
      values.plan,
      JSON.stringify({ projectId: config.projectId, changes }, null, 2) + '\n',
      { flag: 'wx', mode: 0o600 }
    );
    console.log(
      `Dry run for ${config.projectId}: ${changes.length} names; plan saved to ${values.plan}; no database writes`
    );
  }
} finally {
  await deleteApp(app);
}
