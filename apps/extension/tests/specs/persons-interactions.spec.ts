import { TEST_PERSONS } from '@bypass/shared/tests';

import { expect, test } from '../fixtures/persons-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PersonsPanel } from '../utils/persons-panel';

// This test leaves the popup on the bookmarks panel, which the worker-scoped
// page would otherwise carry into whatever runs next
test.afterEach(async ({ personsPage }) => {
  await new PersonsPanel(personsPage).ensureAtRoot();
});

test('opens the bookmarks panel to edit a tagged bookmark', async ({
  personsPage,
}) => {
  const panel = new PersonsPanel(personsPage);
  await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);

  const editButtons = await panel.getEditButtons();
  await editButtons.first().click();

  await expect(new BookmarksPanel(personsPage).getUrlInput()).toBeVisible();
  await expect(personsPage).toHaveURL(/operation=edit/);
});
