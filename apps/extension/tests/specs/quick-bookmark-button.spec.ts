import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';

/**
 * QuickBookmarkButton E2E Tests
 *
 * Tests the QuickBookmarkButton component which provides quick pin/unpin
 * functionality for bookmarks. These tests run sequentially with shared
 * browser context.
 */

const TEST_BOOKMARK_TITLE = 'E2E Test Quick Bookmark';

test('should be disabled when not signed in', async ({ unauthPage }) => {
  const quickBookmarkButton = unauthPage.getByTestId('quick-bookmark-button');
  await homeExpect(quickBookmarkButton).toBeVisible();
  await homeExpect(quickBookmarkButton).toBeDisabled();
});

test.describe('Signed In', () => {
  test('should pin then unpin bookmark from popup flow', async ({
    homePage,
  }) => {
    // Verify logged in state
    const logoutButton = homePage.getByRole('button', { name: 'Logout' });
    await homeExpect(logoutButton).toBeVisible();

    // Button should show Pin state
    const quickBookmarkButton = homePage.getByTestId('quick-bookmark-button');
    await homeExpect(quickBookmarkButton).toBeEnabled();
    await homeExpect(quickBookmarkButton).toContainText('Pin');

    // Click and verify navigation to ADD mode
    await quickBookmarkButton.click();
    await homePage.waitForURL((url) => url.href.includes('/bookmark-panel/'));

    // Verify URL params
    const url = homePage.url();
    homeExpect(url).toContain('operation=add');
    homeExpect(url).toContain('bmUrl=');
    homeExpect(url).toContain('folderId=f3deb0d15f736b649e3c78a3ab28f830');

    // Fill bookmark details
    const dialog = homePage.getByRole('dialog');
    await homeExpect(dialog).toBeVisible();

    const titleInput = dialog.getByPlaceholder('Enter bookmark title');
    await titleInput.fill(TEST_BOOKMARK_TITLE);

    // Save the bookmark (saves to in-memory state)
    const saveButton = dialog.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Wait for dialog to close
    await homeExpect(dialog).toBeHidden();

    // Click the bottom Save button to persist to storage
    const bottomSaveButton = homePage
      .getByRole('button')
      .filter({ hasText: 'Save' });
    const saveButtons = await bottomSaveButton.count();
    await homePage
      .getByRole('button')
      .filter({ hasText: 'Save' })
      .nth(saveButtons - 1)
      .click();

    // Navigate back to home to prepare for next test
    await homePage.goto('/popup.html');
    await homePage.waitForLoadState('domcontentloaded');

    // Wait for button to show Unpin state (bookmark saved)
    await homeExpect(
      homePage.getByTestId('quick-bookmark-button')
    ).toContainText('Unpin');

    // Button should now show "Unpin" state since we bookmarked this page
    const quickBookmarkButtonEdit = homePage.getByTestId(
      'quick-bookmark-button'
    );
    await homeExpect(quickBookmarkButtonEdit).toContainText('Unpin');

    // Click and verify navigation to EDIT mode
    await quickBookmarkButtonEdit.click();
    await homePage.waitForURL((url) => url.href.includes('/bookmark-panel/'));

    // Verify URL params for EDIT mode
    const editUrl = homePage.url();
    homeExpect(editUrl).toContain('operation=edit');
    homeExpect(editUrl).toContain('bmUrl=');
    homeExpect(editUrl).toContain('popup.html');

    // Verify dialog opens with the bookmark we created
    const editDialog = homePage.getByRole('dialog');
    await homeExpect(editDialog).toBeVisible();

    const editTitleInput = editDialog.getByPlaceholder('Enter bookmark title');
    const currentTitle = await editTitleInput.inputValue();
    homeExpect(currentTitle).toBe(TEST_BOOKMARK_TITLE);

    // Delete the bookmark instead of saving
    const deleteButton = editDialog.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    // Wait for dialog to close
    await homeExpect(editDialog).toBeHidden();

    // Click the bottom Save button to persist deletion to storage
    const persistSaveButton = homePage
      .getByRole('button')
      .filter({ hasText: 'Save' });
    const saveButtonsAfterDelete = await persistSaveButton.count();
    await homePage
      .getByRole('button')
      .filter({ hasText: 'Save' })
      .nth(saveButtonsAfterDelete - 1)
      .click();

    // Navigate back to home and verify it shows Pin again (unpinned)
    await homePage.goto('/popup.html');
    await homePage.waitForLoadState('domcontentloaded');

    // Wait for button state to stabilize (bookmark deleted)
    const unpinButton = homePage.getByTestId('quick-bookmark-button');
    await homeExpect(unpinButton).toContainText('Pin');
  });
});
