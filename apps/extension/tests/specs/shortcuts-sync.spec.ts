import { EStorageKey, type IRedirections } from '@bypass/shared';
import { TEST_SHORTCUTS, TEST_TIMEOUTS } from '@bypass/shared/tests';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

import { openExtensionPanelPage } from '../fixtures/base-fixture';
import { ShortcutsPanel } from '../utils/shortcuts-panel';
import { withSignedInProfile } from '../utils/signed-in-profile';
import { getStorageItem, gotoPanel } from '../utils/test-utils';
import {
  failProcedure,
  routeTrpcProcedure,
  succeedProcedure,
} from '../utils/trpc-control';

const NEW_ALIAS = 'http://e2e-shortcut/';
const NEW_WEBSITE = 'https://example.com/';
const REDIRECT_TARGET = 'https://html5test.com';
const INCOMPLETE_ALIAS = 'http:///';

const encode = (rules: IRedirections) =>
  rules.map(({ alias, website, isDefault }) => ({
    alias: btoa(alias),
    website: btoa(website),
    isDefault,
  }));

const decode = (rules: IRedirections) =>
  rules.map(({ alias, website, isDefault }) => ({
    alias: atob(alias),
    website: atob(website),
    isDefault,
  }));

const getStoredRules = async (page: Page) =>
  decode(
    (await getStorageItem<IRedirections>(page, EStorageKey.redirections)) ?? []
  );

/**
 * Stands in for the account: the save is echoed back by the following fetch, so
 * every expectation follows from the edits the test itself made. Shortcut saves
 * are the one panel action that writes remotely, so they can never reach the
 * shared account.
 */
const controlRedirections = async (context: BrowserContext) => {
  const posted: IRedirections[] = [];
  let isFailing = false;
  let current: IRedirections = [];

  await routeTrpcProcedure(
    context,
    'firebaseData.redirectionsPost',
    async (call) => {
      posted.push(call.input as IRedirections);
      if (isFailing) {
        await failProcedure(call);
        return;
      }
      current = call.input as IRedirections;
      await succeedProcedure(call, null);
    }
  );
  await routeTrpcProcedure(
    context,
    'firebaseData.redirectionsGet',
    async (call) => {
      await succeedProcedure(call, encode(current));
    }
  );

  return {
    posted: () => posted,
    setFailing: (failing: boolean) => {
      isFailing = failing;
    },
  };
};

/** DNS never resolves these, but `tabs.onUpdated` still carries the alias. */
const openAliasTab = async (context: BrowserContext, alias: string) => {
  const page = await context.newPage();
  await page
    .goto(alias, { waitUntil: 'commit', timeout: TEST_TIMEOUTS.NAVIGATION })
    .catch(() => undefined);
  return page;
};

const openShortcutsPanel = async (
  context: BrowserContext,
  extensionId: string
) => {
  const page = await openExtensionPanelPage(context, extensionId, 'shortcuts');
  const panel = new ShortcutsPanel(page);
  await panel.waitForLoading();
  return { page, panel };
};

const addRule = async (page: Page, panel: ShortcutsPanel) => {
  await panel.addRule();
  await page.getByTestId('rule-0-alias').fill(NEW_ALIAS);
  await page.getByTestId('rule-0-website').fill(NEW_WEBSITE);
  await page.getByTestId('rule-0-save').click();
};

const save = async (panel: ShortcutsPanel) => {
  await panel.getMainSaveButton().click();
};

test.describe('Shortcuts sync', () => {
  test('stages an edit locally, then saves it durably', async () => {
    await withSignedInProfile({}, async ({ context, extensionId }) => {
      const server = await controlRedirections(context);
      const { page, panel } = await openShortcutsPanel(context, extensionId);
      const storedBefore = await getStoredRules(page);

      await test.step('an edited row stays local until Save', async () => {
        await page.getByTestId('rule-0-website').fill(NEW_WEBSITE);
        await page.getByTestId('rule-0-save').click();

        await expect(panel.getMainSaveButton()).toBeEnabled();
        expect(server.posted()).toHaveLength(0);
        expect(await getStoredRules(page)).toEqual(storedBefore);
      });

      await test.step('Save sends the edited rule and clears the edit', async () => {
        await save(panel);

        await expect(page.getByText('Saved successfully')).toBeVisible();
        await expect(panel.getMainSaveButton()).toBeDisabled();
        expect(server.posted()).toHaveLength(1);
        expect(server.posted()[0][0].website).toBe(NEW_WEBSITE);
      });

      await test.step('the saved rule survives reopening the panel', async () => {
        await gotoPanel(page, 'Shortcuts');
        await panel.waitForLoading();

        await expect(page.getByTestId('rule-0-website')).toHaveValue(
          NEW_WEBSITE
        );
        expect((await getStoredRules(page))[0].website).toBe(NEW_WEBSITE);
      });
    });
  });

  test('keeps reordering inside the list bounds', async () => {
    await withSignedInProfile({}, async ({ context, extensionId }) => {
      const { page, panel } = await openShortcutsPanel(context, extensionId);
      const aliases = await panel.getAliasValues();
      const lastPos = aliases.length - 1;

      await expect(page.getByTestId('rule-0-move-up')).toBeDisabled();
      await expect(
        page.getByTestId(`rule-${lastPos}-move-down`)
      ).toBeDisabled();
      await expect(page.getByTestId('rule-0-move-down')).toBeEnabled();

      await page.getByTestId('rule-0-move-down').click();

      // The boundary follows the position, not the row that moved into it
      await expect(page.getByTestId('rule-0-move-up')).toBeDisabled();
      await expect
        .poll(() => panel.getAliasValues())
        .toEqual([aliases[1], aliases[0], ...aliases.slice(2)]);
    });
  });

  test('saves a rule switched to default', async () => {
    await withSignedInProfile({}, async ({ context, extensionId }) => {
      const server = await controlRedirections(context);
      const { page, panel } = await openShortcutsPanel(context, extensionId);
      const wasDefault = await page.getByTestId('rule-0-default').isChecked();

      await page.getByTestId('rule-0-default').click();
      await page.getByTestId('rule-0-save').click();
      await save(panel);

      await expect(page.getByText('Saved successfully')).toBeVisible();
      expect(server.posted()[0][0].isDefault).toBe(!wasDefault);
      expect((await getStoredRules(page))[0].isDefault).toBe(!wasDefault);
    });
  });

  test('leaves an unfinished row out of the save', async () => {
    await withSignedInProfile({}, async ({ context, extensionId }) => {
      const server = await controlRedirections(context);
      const { page, panel } = await openShortcutsPanel(context, extensionId);
      const storedBefore = await getStoredRules(page);

      await panel.addRule();
      await expect(page.getByTestId('rule-0-alias')).toHaveValue(
        INCOMPLETE_ALIAS
      );

      await save(panel);

      await expect(page.getByText('Saved successfully')).toBeVisible();
      expect(server.posted()[0]).toEqual(storedBefore);
      await expect(panel.getRuleElements()).toHaveCount(storedBefore.length);
    });
  });

  test('saves an emptied rule list', async () => {
    await withSignedInProfile({}, async ({ context, extensionId }) => {
      const server = await controlRedirections(context);
      const { page, panel } = await openShortcutsPanel(context, extensionId);
      const ruleCount = await panel.getRuleCount();

      for (let index = 0; index < ruleCount; index++) {
        await page.getByTestId('rule-0-delete').click();
      }
      await expect(panel.getRuleElements()).toHaveCount(0);

      await save(panel);

      await expect(page.getByText('Saved successfully')).toBeVisible();
      expect(server.posted()[0]).toEqual([]);
      expect(await getStoredRules(page)).toEqual([]);

      await gotoPanel(page, 'Shortcuts');
      await panel.waitForLoading();
      await expect(panel.getRuleElements()).toHaveCount(0);
    });
  });

  test('keeps staged edits when the save fails, and saves them on retry', async () => {
    await withSignedInProfile({}, async ({ context, extensionId }) => {
      const server = await controlRedirections(context);
      server.setFailing(true);
      const { page, panel } = await openShortcutsPanel(context, extensionId);
      const storedBefore = await getStoredRules(page);

      await page.getByTestId('rule-0-website').fill(NEW_WEBSITE);
      await page.getByTestId('rule-0-save').click();
      await save(panel);

      await test.step('the failure keeps the edit and the Save button', async () => {
        await expect(page.getByText('Could not save shortcuts')).toBeVisible();
        await expect(page.getByTestId('rule-0-website')).toHaveValue(
          NEW_WEBSITE
        );
        await expect(panel.getMainSaveButton()).toBeEnabled();
        expect(await getStoredRules(page)).toEqual(storedBefore);
      });

      await test.step('retrying saves the same edit', async () => {
        server.setFailing(false);
        await save(panel);

        await expect(page.getByText('Saved successfully')).toBeVisible();
        expect((await getStoredRules(page))[0].website).toBe(NEW_WEBSITE);
      });
    });
  });

  test('redirects on a newly saved alias and stops once it is deleted', async () => {
    await withSignedInProfile({}, async ({ context, extensionId }) => {
      const server = await controlRedirections(context);
      const { page, panel } = await openShortcutsPanel(context, extensionId);

      await addRule(page, panel);
      await save(panel);
      await expect(page.getByText('Saved successfully')).toBeVisible();
      expect(server.posted()[0][0].alias).toBe(NEW_ALIAS);

      await test.step('the alias redirects without restarting the worker', async () => {
        const tab = await openAliasTab(context, NEW_ALIAS);
        await expect.poll(() => tab.url()).toContain(NEW_WEBSITE);
        await tab.close();
      });

      await page.getByTestId('rule-0-delete').click();
      await save(panel);
      await expect(page.getByText('Saved successfully')).toBeVisible();

      await test.step('the deleted alias is left alone', async () => {
        const deletedTab = await openAliasTab(context, NEW_ALIAS);
        // A later navigation the worker does redirect, so the deleted alias had
        // its chance: without it, the assertion below passes on first look
        const liveTab = await openAliasTab(context, TEST_SHORTCUTS.BROWSERTEST);
        await expect.poll(() => liveTab.url()).toContain(REDIRECT_TARGET);

        expect(deletedTab.url()).not.toContain(NEW_WEBSITE);
        await Promise.all([deletedTab.close(), liveTab.close()]);
      });
    });
  });
});
