import { TEST_PERSONS } from '@bypass/shared/tests';

import { expect, personsTest as test } from '../fixtures/panel-fixture';
import { PersonsPanel } from '../utils/persons-panel';

// Before, so a neighbouring spec cannot hand this one a dirty page; after, so
// this one cannot hand the next a modal it left open
test.beforeEach(async ({ personsPage }) => {
  await new PersonsPanel(personsPage).ensureAtRoot();
});

test.afterEach(async ({ personsPage }) => {
  await new PersonsPanel(personsPage).ensureAtRoot();
});

test.describe('Search hotkey', () => {
  test('focuses the panel search', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    // The hotkey proves nothing if the search is already focused
    await expect(panel.getSearchInput()).toBeVisible();
    await expect(panel.getSearchInput()).not.toBeFocused();

    await personsPage.keyboard.press('ControlOrMeta+f');

    await expect(panel.getSearchInput()).toBeFocused();
  });

  test('focuses the innermost search when a modal is open', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
    // Waited for first: a negative assertion on an unattached locator passes
    // instantly, which would let the key press land before the modal exists
    await expect(panel.getModalSearchInput()).toBeVisible();

    await expect(panel.getFocusedBookmarksDialog()).toBeAttached();
    await expect(panel.getModalSearchInput()).not.toBeFocused();

    await personsPage.keyboard.press('ControlOrMeta+f');

    // Two search inputs are mounted; the hotkey has to pick the modal's
    await expect(panel.getModalSearchInput()).toBeFocused();
  });
});
