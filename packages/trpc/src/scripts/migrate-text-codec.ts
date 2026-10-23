/* eslint-disable no-await-in-loop -- A conflicting record must stop later writes. */
import { readFileSync, writeFileSync } from 'node:fs';
import { isDeepStrictEqual, parseArgs } from 'node:util';

import { loadRootEnv } from '@bypass/configs/env';
import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { z } from 'zod/mini';

import { NameEncodingSchema } from '../../../shared/src/schema/nameEncodingSchema.ts';
// Direct Node execution needs the pure module's explicit file extension.
import {
  encodeName,
  encodeText,
  isEncodedName,
} from '../../../shared/src/utils/codec.ts';

const keepCached = () => {};

const { values } = parseArgs({
  options: {
    project: { type: 'string' },
    plan: { type: 'string' },
    scope: { type: 'string', default: 'names' },
    'dry-run': { type: 'boolean' },
    apply: { type: 'boolean', default: false },
  },
});
if (
  !['dev', 'prod'].includes(values.project ?? '') ||
  !values.plan ||
  !['names', 'shortcuts'].includes(values.scope) ||
  (values.apply && values['dry-run'])
) {
  throw new Error(
    'Usage: node packages/trpc/src/scripts/migrate-text-codec.ts --project dev|prod --plan /absolute/path.json [--scope names|shortcuts] [--dry-run|--apply]'
  );
}

const nameRecordSchema = z.looseObject({
  name: z.string(),
  nameEncoding: z.optional(NameEncodingSchema),
});
const nameChangeSchema = z.object({
  path: z
    .string()
    .check(
      z.regex(
        /^data\/[^/.#$[\]]+\/(?:persons\/[^/.#$[\]]+|bookmarks\/folderList\/[^/.#$[\]]+)$/
      )
    ),
  before: nameRecordSchema,
  after: nameRecordSchema,
});
const legacyShortcutSchema = z.strictObject({
  id: z.optional(z.uuid()),
  alias: z.string(),
  website: z.string(),
  isDefault: z.boolean(),
});
const shortcutSchema = z.strictObject({
  id: z.uuid(),
  alias: z.string(),
  website: z.string(),
  isDefault: z.boolean(),
});
const shortcutChangeSchema = z.object({
  path: z
    .string()
    .check(z.regex(/^data\/[^/.#$[\]]+\/redirections\/(?:0|[1-9]\d*)$/)),
  before: legacyShortcutSchema,
  after: shortcutSchema,
});
const changeSchema = z.union([nameChangeSchema, shortcutChangeSchema]);
const planSchema = z.object({
  formatVersion: z.literal(2),
  projectId: z.string(),
  scope: z.optional(z.enum(['names', 'shortcuts'])),
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
    const parsed = planSchema.safeParse(
      JSON.parse(readFileSync(values.plan, 'utf8'))
    );
    if (!parsed.success) {
      throw new Error(
        'Invalid or outdated migration plan; regenerate a dry-run plan with this script'
      );
    }
    const plan = parsed.data;
    if (plan.projectId !== config.projectId) {
      throw new Error(
        `Plan belongs to ${plan.projectId}, expected ${config.projectId}`
      );
    }
    if ((plan.scope ?? 'names') !== values.scope) {
      throw new Error('Plan scope does not match --scope');
    }
    for (const entry of plan.changes) {
      if (values.scope === 'names') {
        const change = nameChangeSchema.parse(entry);
        const original = atob(change.before.name);
        const expected = encodeName({ ...change.before, name: original });
        if (
          isEncodedName(change.before) ||
          !original.includes('%') ||
          !isDeepStrictEqual(change.after, expected)
        ) {
          throw new Error(`Invalid legacy-name rewrite at ${change.path}`);
        }
      } else {
        const change = shortcutChangeSchema.parse(entry);
        const expected = {
          ...change.before,
          id: change.before.id ?? change.after.id,
          alias: encodeText(atob(change.before.alias)),
          website: encodeText(atob(change.before.website)),
        };
        if (!isDeepStrictEqual(change.after, expected)) {
          throw new Error(`Invalid legacy-shortcut rewrite at ${change.path}`);
        }
      }
    }
    for (const change of plan.changes) {
      const ref = database.ref(change.path);
      // Keep the read cached so the transaction does not start with an unknown null.
      ref.on('value', keepCached);
      let result;
      try {
        await ref.once('value');
        result = await ref.transaction(
          (current) =>
            !isDeepStrictEqual(current, change.after) &&
            isDeepStrictEqual(current, change.before)
              ? change.after
              : undefined,
          undefined,
          false
        );
      } finally {
        ref.off('value', keepCached);
      }
      if (
        !result.committed &&
        !isDeepStrictEqual(result.snapshot.val(), change.after)
      ) {
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
      `Applied plan for ${config.projectId}: ${plan.changes.length} ${values.scope} records`
    );
  } else {
    const changes: z.infer<typeof changeSchema>[] = [];
    const data = await database.ref('data').once('value');
    data.forEach((user) => {
      if (values.scope === 'shortcuts') {
        user.child('redirections').forEach((record) => {
          const before = legacyShortcutSchema.parse(record.val());
          const change = shortcutChangeSchema.parse({
            path: `data/${user.key}/redirections/${record.key}`,
            before,
            after: {
              ...before,
              id: before.id ?? crypto.randomUUID(),
              alias: encodeText(atob(before.alias)),
              website: encodeText(atob(before.website)),
            },
          });
          changes.push(change);
          console.log(JSON.stringify(change));
        });
      } else {
        for (const collection of ['persons', 'bookmarks/folderList']) {
          user.child(collection).forEach((record) => {
            const before = nameRecordSchema.parse(record.val());
            if (isEncodedName(before)) {
              return;
            }
            const original = atob(before.name);
            if (original.includes('%')) {
              const change = nameChangeSchema.parse({
                path: `data/${user.key}/${collection}/${record.key}`,
                before,
                after: encodeName({ ...before, name: original }),
              });
              changes.push(change);
              console.log(JSON.stringify(change));
            }
          });
        }
      }
    });
    writeFileSync(
      values.plan,
      JSON.stringify(
        {
          formatVersion: 2,
          projectId: config.projectId,
          scope: values.scope,
          changes,
        },
        null,
        2
      ) + '\n',
      { flag: 'wx', mode: 0o600 }
    );
    console.log(
      `Dry run for ${config.projectId}: ${changes.length} ${values.scope} records; plan saved to ${values.plan}; no database writes`
    );
  }
} finally {
  await deleteApp(app);
}
