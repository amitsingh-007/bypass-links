import {
  clearSearchInput,
  fillSearchInput,
  TEST_BOOKMARKS,
  TEST_PERSONS,
} from '@bypass/shared/tests';

import { expect, bookmarkTest as test } from '../fixtures/panel-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';

const PERSON_SEARCH_PLACEHOLDER = 'Search persons...';

/**
 * Stays on the root listing, where the fixture bookmark lives: `openFolder`
 * single-clicks, and the folder component navigates only on double-click.
 */
const openPersonSelect = async (panel: BookmarksPanel) => {
  await panel.ensureAtRoot();
  return panel.openPersonSelect(TEST_BOOKMARKS.REACT_DOCS);
};

// The dialog holds unsaved edits, and the page is worker scoped
test.afterEach(async ({ bookmarksPage }) => {
  await new BookmarksPanel(bookmarksPage).ensureAtRoot();
});

test.describe('Tagging a bookmark with a person', () => {
  test('filters, sorts, and previews person options', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    const dialog = await openPersonSelect(panel);
    const options = bookmarksPage.getByRole('option');

    await test.step('narrows the list to the typed name', async () => {
      await fillSearchInput(dialog, 'Donald', PERSON_SEARCH_PLACEHOLDER);
      await expect(options).toHaveText([TEST_PERSONS.DONALD]);
      await clearSearchInput(dialog, PERSON_SEARCH_PLACEHOLDER);
    });

    await test.step('shows an empty state when no person matches', async () => {
      await fillSearchInput(
        dialog,
        'nobody-by-this-name',
        PERSON_SEARCH_PLACEHOLDER
      );
      await expect(bookmarksPage.getByText('No persons found')).toBeVisible();
      await expect(options).toHaveCount(0);
      await clearSearchInput(dialog, PERSON_SEARCH_PLACEHOLDER);
    });

    await test.step('previews a person behind their avatar', async () => {
      await bookmarksPage
        .getByTestId(`person-avatar-${TEST_PERSONS.DONALD}`)
        .hover();

      const preview = bookmarksPage.locator(
        '[data-testid^="person-avatar-preview-"]'
      );
      await expect(preview).toBeVisible();
      await preview.locator('[data-slot="avatar"]').hover();
      await expect(
        bookmarksPage.locator('[data-slot="tooltip-content"]')
      ).toContainText(TEST_PERSONS.DONALD);
    });

    await test.step('sorts alphabetically once recency sorting is turned off', async () => {
      const recencySwitch = dialog.getByTestId('recency-switch');
      await expect(options).not.toHaveCount(0);
      const byRecency = await options.allTextContents();
      const alphabetical = byRecency.toSorted((left, right) =>
        left.localeCompare(right)
      );

      expect(
        byRecency,
        'the account lists persons alphabetically already, so toggling the sort proves nothing'
      ).not.toEqual(alphabetical);

      await recencySwitch.click();
      await expect(recencySwitch).not.toBeChecked();
      await expect(options).toHaveText(alphabetical);
    });
  });
});
