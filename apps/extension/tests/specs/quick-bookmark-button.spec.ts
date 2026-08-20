import { POPUP_HOMEPAGE } from '@/constants';

import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';

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
    const logoutButton = homePage.getByRole('button', { name: 'Logout' });
    await homeExpect(logoutButton).toBeVisible();

    const quickBookmarkButton = homePage.getByTestId('quick-bookmark-button');
    await homeExpect(quickBookmarkButton).toBeEnabled();
    await homeExpect(quickBookmarkButton).toContainText('Pin');

    await quickBookmarkButton.click();
    await homePage.waitForURL((url) => url.href.includes('/bookmark-panel/'));

    const url = homePage.url();
    homeExpect(url).toContain('operation=add');
    homeExpect(url).toContain('bmUrl=');
    homeExpect(url).toContain('folderId=f3deb0d15f736b649e3c78a3ab28f830');

    const dialog = homePage.getByRole('dialog');
    await homeExpect(dialog).toBeVisible();

    const titleInput = dialog.getByPlaceholder('Enter bookmark title');
    await titleInput.fill(TEST_BOOKMARK_TITLE);

    // Save the bookmark (saves to in-memory state)
    const saveButton = dialog.getByRole('button', { name: 'Save' });
    await saveButton.click();

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

    await homePage.goto(POPUP_HOMEPAGE);
    await homePage.waitForLoadState('domcontentloaded');

    await homeExpect(
      homePage.getByTestId('quick-bookmark-button')
    ).toContainText('Unpin');

    const quickBookmarkButtonEdit = homePage.getByTestId(
      'quick-bookmark-button'
    );
    await homeExpect(quickBookmarkButtonEdit).toContainText('Unpin');

    await quickBookmarkButtonEdit.click();
    await homePage.waitForURL((navUrl) =>
      navUrl.href.includes('/bookmark-panel/')
    );

    const editUrl = homePage.url();
    homeExpect(editUrl).toContain('operation=edit');
    homeExpect(editUrl).toContain('bmUrl=');
    homeExpect(editUrl).toContain('popup.html');

    const editDialog = homePage.getByRole('dialog');
    await homeExpect(editDialog).toBeVisible();

    const editTitleInput = editDialog.getByPlaceholder('Enter bookmark title');
    const currentTitle = await editTitleInput.inputValue();
    homeExpect(currentTitle).toBe(TEST_BOOKMARK_TITLE);

    const deleteButton = editDialog.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

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

    await homePage.goto(POPUP_HOMEPAGE);
    await homePage.waitForLoadState('domcontentloaded');

    const unpinButton = homePage.getByTestId('quick-bookmark-button');
    await homeExpect(unpinButton).toContainText('Pin');
  });
});
