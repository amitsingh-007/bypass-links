import { TEST_BOOKMARKS, TEST_PERSONS } from '@bypass/shared/tests';

import { expect, test } from '../fixtures/bookmark-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { fillSearchInput } from '../utils/test-utils';

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
  test('narrows the list to the typed name', async ({ bookmarksPage }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    const dialog = await openPersonSelect(panel);

    await fillSearchInput(dialog, 'Donald', PERSON_SEARCH_PLACEHOLDER);

    await expect(bookmarksPage.getByRole('option')).toHaveText([
      TEST_PERSONS.DONALD,
    ]);
  });

  test('shows an empty state when no person matches', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    const dialog = await openPersonSelect(panel);

    await fillSearchInput(
      dialog,
      'nobody-by-this-name',
      PERSON_SEARCH_PLACEHOLDER
    );

    await expect(bookmarksPage.getByText('No persons found')).toBeVisible();
    await expect(bookmarksPage.getByRole('option')).toHaveCount(0);
  });

  test('sorts alphabetically once recency sorting is turned off', async ({
    bookmarksPage,
  }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    const dialog = await openPersonSelect(panel);
    const options = bookmarksPage.getByRole('option');
    // Selected by test id, not role: the open combobox takes the rest of the
    // dialog out of the accessibility tree, so getByRole('switch') finds nothing
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

  test('previews a person behind their avatar', async ({ bookmarksPage }) => {
    const panel = new BookmarksPanel(bookmarksPage);
    await openPersonSelect(panel);

    // Options are portaled out of the dialog
    await bookmarksPage
      .getByTestId(`person-avatar-${TEST_PERSONS.DONALD}`)
      .hover();

    const preview = bookmarksPage.locator(
      '[data-testid^="person-avatar-preview-"]'
    );
    await expect(preview).toBeVisible();

    // The tooltip lives inside the portaled hover card, wired to a provider
    // outside it, which is the composition worth guarding
    await preview.locator('[data-slot="avatar"]').hover();
    await expect(
      bookmarksPage.locator('[data-slot="tooltip-content"]')
    ).toContainText(TEST_PERSONS.DONALD);
  });
});
