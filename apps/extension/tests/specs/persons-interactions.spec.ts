import { TEST_PERSONS } from '@bypass/shared/tests';

import { expect, personsTest as test } from '../fixtures/panel-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PersonsPanel } from '../utils/persons-panel';
import { getPersonUids } from '../utils/test-utils';

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

test.describe('Person bookmark dialogs', () => {
  test('opens the first duplicate person query value', async ({
    personsPage,
  }) => {
    const uids = await getPersonUids(personsPage);
    const query = new URLSearchParams([
      ['openBookmarksList', uids[TEST_PERSONS.JOHN_NATHAN]],
      ['openBookmarksList', uids[TEST_PERSONS.DONALD]],
    ]).toString();
    await personsPage.evaluate(
      (search) => window.history.pushState(null, '', `?${search}`),
      query
    );

    await new PersonsPanel(personsPage).verifyPersonNameInBadge(
      TEST_PERSONS.JOHN_NATHAN
    );
  });

  test('resets the bookmark filter when a person dialog reopens', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    const { allBookmarksBefore } = await panel.searchWithinBookmarks(
      'no-bookmark-matches-this-query',
      TEST_PERSONS.JOHN_NATHAN
    );

    await panel.navigateBack();
    await expect(panel.getBookmarksDialog()).toBeHidden();
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);

    await expect(
      panel.getBookmarksDialog().getByPlaceholder('Search')
    ).toHaveValue('');
    await expect(await panel.getEditButtons()).toHaveCount(allBookmarksBefore);
  });
});
