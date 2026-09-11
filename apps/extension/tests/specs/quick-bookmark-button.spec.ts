import { ROOT_FOLDER_NAME } from '@bypass/shared';
import { TEST_FOLDERS, TEST_SITES } from '@bypass/shared/tests';

import { POPUP_HOMEPAGE } from '@/constants';

import { test, expect as homeExpect } from '../fixtures/home-popup-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { seedFolderWithBookmarks } from '../utils/test-utils';

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

  /** Must stay a background tab: bringing it forward would make it the active tab. */
  test('pins the active tab into the default folder', async ({
    homePage,
    context,
  }) => {
    const panel = new BookmarksPanel(homePage);
    let isMainDefault = false;
    const unsetMainDefault = async () => {
      await panel.ensureAtRoot();
      await panel.setFolderDefault(TEST_FOLDERS.MAIN, false);
      await panel.clickSaveButton();
      isMainDefault = false;
    };

    try {
      await panel.ensureAtRoot();
      await panel.setFolderDefault(TEST_FOLDERS.MAIN, true);
      isMainDefault = true;
      await panel.clickSaveButton();

      const activeTab = await context.newPage();
      await activeTab.goto(`${TEST_SITES.EXAMPLE_COM}/`);
      const activeTitle = await activeTab.title();

      try {
        await homePage.goto(POPUP_HOMEPAGE);
        const quickBookmarkButton = homePage.getByTestId(
          'quick-bookmark-button'
        );
        await homeExpect(quickBookmarkButton).toContainText('Pin');
        await quickBookmarkButton.click();
        await homePage.waitForURL((url) =>
          url.href.includes('/bookmark-panel/')
        );

        const dialog = homePage.getByRole('dialog');
        await homeExpect(
          dialog.getByTestId('bookmark-title-input')
        ).toHaveValue(activeTitle);
        await homeExpect(panel.getUrlInput()).toHaveValue(
          `${TEST_SITES.EXAMPLE_COM}/`
        );
        await homeExpect(
          dialog.getByTestId('bookmark-folder-select')
        ).toContainText(TEST_FOLDERS.MAIN);
        await panel.closeDialog();
      } finally {
        await activeTab.close();
      }

      // Root takes the add dialog over once the default folder is gone
      await unsetMainDefault();
      const nextTab = await context.newPage();
      await nextTab.goto(`${TEST_SITES.EXAMPLE_NET}/`);
      try {
        await homePage.goto(POPUP_HOMEPAGE);
        await homePage.getByTestId('quick-bookmark-button').click();
        await homePage.waitForURL((url) =>
          url.href.includes('/bookmark-panel/')
        );

        await homeExpect(
          homePage.getByRole('dialog').getByTestId('bookmark-folder-select')
        ).toContainText(ROOT_FOLDER_NAME);
        await panel.closeDialog();
      } finally {
        await nextTab.close();
      }
    } finally {
      // The worker's profile outlives this test, so the default cannot be left behind
      if (isMainDefault) {
        await unsetMainDefault();
      }
    }
  });

  test('opens an existing bookmark in the folder that holds it', async ({
    homePage,
    context,
  }) => {
    const folderName = 'Quick Bookmark Folder';
    const bookmarkTitle = 'Quick Bookmark Target';
    const { folderId } = await seedFolderWithBookmarks(homePage, folderName, [
      { title: bookmarkTitle, url: `${TEST_SITES.EXAMPLE_ORG}/` },
    ]);
    const activeTab = await context.newPage();
    await activeTab.goto(`${TEST_SITES.EXAMPLE_ORG}/`);

    try {
      await homePage.goto(POPUP_HOMEPAGE);
      const quickBookmarkButton = homePage.getByTestId('quick-bookmark-button');
      await homeExpect(quickBookmarkButton).toContainText('Unpin');
      await quickBookmarkButton.click();
      await homePage.waitForURL((url) => url.href.includes('/bookmark-panel/'));

      const url = homePage.url();
      homeExpect(url).toContain('operation=edit');
      homeExpect(url).toContain(`folderId=${folderId}`);
      await homeExpect(
        homePage.getByRole('dialog').getByTestId('bookmark-title-input')
      ).toHaveValue(bookmarkTitle);
      await new BookmarksPanel(homePage).closeDialog();
    } finally {
      await activeTab.close();
    }
  });
});
