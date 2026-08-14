import { TEST_PERSONS } from '@bypass/shared/tests';

import { expect, test } from '../fixtures/persons-fixture';
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
    // The dialog moves focus into itself on open, so prove it did not land here
    await expect(panel.getModalSearchInput()).not.toBeFocused();

    await personsPage.keyboard.press('ControlOrMeta+f');

    // Two search inputs are mounted; the hotkey has to pick the modal's
    await expect(panel.getModalSearchInput()).toBeFocused();
  });
});
