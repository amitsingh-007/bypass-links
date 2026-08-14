import { TEST_PERSONS } from '@bypass/shared/tests';

import { expect, test } from '../fixtures/persons-fixture';
import { PersonsPanel } from '../utils/persons-panel';

test.afterEach(async ({ personsPage }) => {
  await new PersonsPanel(personsPage).ensureAtRoot();
});

test.describe('Search hotkey', () => {
  test('focuses the panel search', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.ensureAtRoot();

    await personsPage.keyboard.press('ControlOrMeta+f');

    await expect(panel.getSearchInput()).toBeFocused();
  });

  test('focuses the innermost search when a modal is open', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.ensureAtRoot();
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
    // The dialog moves focus into itself on open, so prove it did not land here
    await expect(panel.getModalSearchInput()).not.toBeFocused();

    await personsPage.keyboard.press('ControlOrMeta+f');

    // Two search inputs are mounted; the hotkey has to pick the modal's
    await expect(panel.getModalSearchInput()).toBeFocused();
  });
});
