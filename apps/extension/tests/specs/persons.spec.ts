import { test, expect } from '../fixtures/persons-fixture';
import { TEST_PERSONS } from '../constants';
import { navigateBack, openPersonCard } from '../utils/test-utils';

/**
 * Persons Panel E2E Tests
 *
 * These tests run sequentially with a single login at the start.
 * The browser context persists across all tests in this describe block.
 *
 * IMPORTANT: Test order matters! Do not reorder tests without understanding dependencies.
 */
test.describe.serial('Persons Panel', () => {
  test.describe('Search Person', () => {
    test('should search and filter persons', async ({ personsPage }) => {
      // Fill search input with person name
      const searchInput = personsPage.getByPlaceholder('Search');
      await searchInput.fill('John');
      await personsPage.waitForTimeout(300);

      // Verify matching person is visible
      const johnCard = personsPage
        .locator('[data-person-uid]')
        .filter({ hasText: TEST_PERSONS.JOHN_NATHAN });
      await expect(johnCard).toBeVisible();

      // Verify non-matching person is hidden
      const akashCard = personsPage
        .locator('[data-person-uid]')
        .filter({ hasText: TEST_PERSONS.AKASH_KUMAR_SINGH });
      await expect(akashCard).not.toBeVisible();

      // Clear search and verify all persons are visible again
      await searchInput.clear();
      await personsPage.waitForTimeout(300);

      await expect(akashCard).toBeVisible();
    });

    test('should clear search and show all persons', async ({
      personsPage,
    }) => {
      // Get initial person count
      const searchInput = personsPage.getByPlaceholder('Search');
      const allPersonsBefore = await personsPage
        .locator('[data-person-uid]')
        .count();

      // Search for non-existent person
      await searchInput.fill('NonExistentPerson');
      await personsPage.waitForTimeout(300);

      // Verify no persons are shown
      const noResultsPersons = await personsPage
        .locator('[data-person-uid]')
        .count();
      expect(noResultsPersons).toBe(0);

      // Clear search and verify all persons are visible again
      await searchInput.clear();
      await personsPage.waitForTimeout(300);

      const allPersonsAfter = await personsPage
        .locator('[data-person-uid]')
        .count();
      expect(allPersonsAfter).toBe(allPersonsBefore);
    });
  });

  test.describe('Add Person', () => {
    test('should open add person dialog', async ({ personsPage }) => {
      // Click add person button in header (using exact match to avoid picking person cards)
      const addButton = personsPage.getByRole('button', {
        name: 'Add',
        exact: true,
      });
      await addButton.click();

      // Wait for "Add Person" dialog to open
      const dialog = personsPage.getByRole('dialog', { name: 'Add Person' });
      await expect(dialog).toBeVisible();

      // Verify name input is visible
      const nameInput = dialog.getByPlaceholder('Enter name');
      await expect(nameInput).toBeVisible();

      // Close dialog without saving
      const closeButton = dialog.locator('button.mantine-Modal-close');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    test('should add person with name and image', async ({ personsPage }) => {
      const TEST_PERSON_NAME = 'E2E Test Person';
      const TEST_IMAGE_URL = 'https://picsum.photos/200';

      // Click add person button
      const addButton = personsPage.getByRole('button', {
        name: 'Add',
        exact: true,
      });
      await addButton.click();

      // Wait for "Add Person" dialog to open
      const dialog = personsPage.getByRole('dialog', { name: 'Add Person' });
      await expect(dialog).toBeVisible();

      // Fill person name
      const nameInput = dialog.getByPlaceholder('Enter name');
      await nameInput.fill(TEST_PERSON_NAME);

      // Click on edit icon to open ImagePicker
      const editIcon = dialog.locator('.mantine-ActionIcon-root');
      await editIcon.click();

      // Wait for ImagePicker dialog to open
      const imagePickerDialog = personsPage
        .locator('.mantine-Modal-inner')
        .filter({ hasText: 'Upload Image' });
      await expect(imagePickerDialog).toBeVisible();

      // Enter image URL
      const imageUrlInput =
        imagePickerDialog.getByPlaceholder('Enter image url');
      await imageUrlInput.fill(TEST_IMAGE_URL);

      // Wait for image to load (debounce is 500ms + AvatarEditor loading time)
      await personsPage.waitForTimeout(5000);

      // Click "Save Cropped Image" button
      const saveCroppedButton = personsPage.getByTestId('save-cropped-image');
      await expect(saveCroppedButton).toBeEnabled();
      await saveCroppedButton.click();

      // Wait for upload overlay to appear
      const uploadOverlay = personsPage.getByTestId('uploading-overlay');
      await expect(uploadOverlay).toBeVisible();

      // Wait for upload to complete and overlay to disappear (may take time for upload)
      await expect(imagePickerDialog).toBeHidden({ timeout: 30_000 });
      await expect(imagePickerDialog).toBeHidden();

      // Click Save button in Add Person dialog
      const saveButton = dialog.getByRole('button', { name: 'Save' });
      await saveButton.click();

      // Wait for dialog to close
      await expect(dialog).toBeHidden();

      // Verify person appears in the list
      const newPersonCard = personsPage
        .locator('[data-person-uid]')
        .filter({ hasText: TEST_PERSON_NAME });
      await expect(newPersonCard).toBeVisible();
    });
  });
});

test.describe('Edit Person', () => {
  test('should edit person name', async ({ personsPage }) => {
    const EDITED_PREFIX = '(Edited) ';

    // Right-click on person to open context menu
    const johnCard = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: TEST_PERSONS.JOHN_NATHAN });
    await johnCard.click({ button: 'right' });

    // Click Edit option
    const editOption = personsPage.locator(
      '.mantine-contextmenu-item-button-title',
      { hasText: 'Edit' }
    );
    await editOption.waitFor({ state: 'attached' });
    await editOption.evaluate((el) => (el as HTMLElement).click());

    // Wait for dialog to open
    const dialog = personsPage.getByRole('dialog', { name: 'Edit Person' });
    await expect(dialog).toBeVisible();

    // Verify dialog has correct name pre-filled
    const nameInput = dialog.getByPlaceholder('Enter name');
    const originalName = await nameInput.inputValue();
    expect(originalName).toBe(TEST_PERSONS.JOHN_NATHAN);

    // Append "(Edited)" prefix to the name
    await nameInput.fill(EDITED_PREFIX + TEST_PERSONS.JOHN_NATHAN);

    // Click Save button
    const saveButton = dialog.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Wait for dialog to close
    await expect(dialog).toBeHidden();

    // Verify the name is updated in the person card
    const editedJohnCard = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: EDITED_PREFIX + TEST_PERSONS.JOHN_NATHAN });
    await expect(editedJohnCard).toBeVisible();

    // Revert the name back to original
    await editedJohnCard.click({ button: 'right' });

    const editOption2 = personsPage.locator(
      '.mantine-contextmenu-item-button-title',
      { hasText: 'Edit' }
    );
    await editOption2.waitFor({ state: 'attached' });
    await editOption2.evaluate((el) => (el as HTMLElement).click());

    const dialog2 = personsPage.getByRole('dialog', { name: 'Edit Person' });
    await expect(dialog2).toBeVisible();

    const nameInput2 = dialog2.getByPlaceholder('Enter name');
    await nameInput2.fill(TEST_PERSONS.JOHN_NATHAN);

    const saveButton2 = dialog2.getByRole('button', { name: 'Save' });
    await saveButton2.click();

    await expect(dialog2).toBeHidden();

    // Verify name is reverted
    const revertedJohnCard = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: TEST_PERSONS.JOHN_NATHAN });
    await expect(revertedJohnCard).toBeVisible();
  });

  test('should verify avatar image is visible in edit dialog', async ({
    personsPage,
  }) => {
    // Right-click on person to open context menu
    const akashCard = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: TEST_PERSONS.AKASH_KUMAR_SINGH });
    await akashCard.click({ button: 'right' });

    // Click Edit option
    const editOption = personsPage.locator(
      '.mantine-contextmenu-item-button-title',
      { hasText: 'Edit' }
    );
    await editOption.waitFor({ state: 'attached' });
    await editOption.evaluate((el) => (el as HTMLElement).click());

    // Wait for dialog to open
    const dialog = personsPage.getByRole('dialog', { name: 'Edit Person' });
    await expect(dialog).toBeVisible();

    // Verify avatar image is visible
    const avatar = dialog.locator('img');
    await expect(avatar).toBeVisible();

    // Close dialog without saving
    const closeButton = dialog.locator('button.mantine-Modal-close');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  });

  test('should change person image', async ({ personsPage }) => {
    const NEW_IMAGE_URL = 'https://picsum.photos/250';

    // Right-click on person to open context menu
    const donaldCard = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: TEST_PERSONS.DONALD });
    await donaldCard.click({ button: 'right' });

    // Click Edit option
    const editOption = personsPage.locator(
      '.mantine-contextmenu-item-button-title',
      { hasText: 'Edit' }
    );
    await editOption.waitFor({ state: 'attached' });
    await editOption.evaluate((el) => (el as HTMLElement).click());

    // Wait for dialog to open
    const dialog = personsPage.getByRole('dialog', { name: 'Edit Person' });
    await expect(dialog).toBeVisible();

    // Click on edit icon to open ImagePicker
    const editIcon = dialog.locator('.mantine-ActionIcon-root');
    await editIcon.click();

    // Wait for ImagePicker dialog to open
    const imagePickerDialog = personsPage
      .locator('.mantine-Modal-inner')
      .filter({ hasText: 'Upload Image' });
    await expect(imagePickerDialog).toBeVisible();

    // Enter new image URL
    const imageUrlInput = imagePickerDialog.getByPlaceholder('Enter image url');
    await imageUrlInput.fill(NEW_IMAGE_URL);

    // Wait for image to load
    await personsPage.waitForTimeout(5000);

    // Click "Save Cropped Image" button
    const saveCroppedButton = personsPage.getByTestId('save-cropped-image');
    await expect(saveCroppedButton).toBeEnabled();
    await saveCroppedButton.click();

    // Wait for upload overlay to appear
    const uploadOverlay = personsPage.getByTestId('uploading-overlay');
    await expect(uploadOverlay).toBeVisible();

    // Wait for upload to complete and overlay to disappear
    await expect(imagePickerDialog).toBeHidden({ timeout: 30_000 });

    // Click Save button in Edit Person dialog
    const saveButton = dialog.getByRole('button', { name: 'Save' });
    await saveButton.click();

    // Wait for dialog to close
    await expect(dialog).toBeHidden();

    // Verify image was updated (check that avatar is still visible)
    const donaldCardAfter = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: TEST_PERSONS.DONALD });
    await expect(donaldCardAfter).toBeVisible();
  });
});

test.describe('Open Tagged Bookmarks', () => {
  test('should open tagged bookmarks for a person', async ({ personsPage }) => {
    // Click on person card to open their tagged bookmarks
    await openPersonCard(personsPage, TEST_PERSONS.JOHN_NATHAN);

    // Verify URL changed to persons-panel
    await personsPage.waitForURL(/persons-panel/);

    // Verify badge shows person name
    const headerBadge = personsPage
      .locator('.mantine-Badge-label')
      .filter({ hasText: TEST_PERSONS.JOHN_NATHAN });
    await expect(headerBadge).toBeVisible();

    const badgeText = (await headerBadge.textContent()) ?? '';
    expect(badgeText).toContain(TEST_PERSONS.JOHN_NATHAN);

    // Verify bookmarks are displayed with edit buttons
    const editButtons = personsPage.getByTitle('Edit Bookmark');
    const rowCount = await editButtons.count();
    expect(rowCount).toBeGreaterThan(0);

    // Navigate back to persons list
    await navigateBack(personsPage);
  });

  test('should display correct bookmark count in badge', async ({
    personsPage,
  }) => {
    // Open person's tagged bookmarks
    await openPersonCard(personsPage, TEST_PERSONS.AKASH_KUMAR_SINGH);
    await personsPage.waitForTimeout(500);

    // Verify badge displays count in format "Name (N)"
    const headerBadge = personsPage
      .locator('.mantine-Badge-label')
      .filter({ hasText: TEST_PERSONS.AKASH_KUMAR_SINGH });
    await expect(headerBadge).toBeVisible();

    const badgeText = (await headerBadge.textContent()) ?? '';
    const countMatch = /\((\d+)\)/.exec(badgeText);
    if (countMatch) {
      const count = Number.parseInt(countMatch[1], 10);
      expect(count).toBeGreaterThanOrEqual(0);
    }

    // Verify count matches actual bookmark count
    const editButtons = personsPage.getByTitle('Edit Bookmark');
    const actualCount = await editButtons.count();
    if (countMatch) {
      const badgeCount = Number.parseInt(countMatch[1], 10);
      expect(actualCount).toBe(badgeCount);
    }

    // Navigate back
    await navigateBack(personsPage);
  });
});

test.describe('Search Tagged Bookmarks', () => {
  test('should search within tagged bookmarks', async ({ personsPage }) => {
    // Open person's tagged bookmarks
    await openPersonCard(personsPage, TEST_PERSONS.DONALD);
    await personsPage.waitForTimeout(500);

    // Get search input within modal
    const searchInput = personsPage
      .locator('.mantine-Modal-content')
      .getByPlaceholder('Search');

    // Count all visible bookmarks
    const allBookmarksBefore = await personsPage
      .getByTitle('Edit Bookmark')
      .count();
    expect(allBookmarksBefore).toBeGreaterThan(0);

    // Search for non-existent bookmark
    await searchInput.fill('nonexistentbookmark123');
    await personsPage.waitForTimeout(300);

    // Verify no bookmarks are shown
    const noResultsBookmarks = await personsPage
      .getByTitle('Edit Bookmark')
      .count();
    expect(noResultsBookmarks).toBe(0);

    // Clear search and verify all bookmarks are visible again
    await searchInput.clear();
    await personsPage.waitForTimeout(300);

    const allBookmarksAfter = await personsPage
      .getByTitle('Edit Bookmark')
      .count();
    expect(allBookmarksAfter).toBe(allBookmarksBefore);

    // Navigate back
    await navigateBack(personsPage);
  });
});

test.describe('Open Tagged Bookmark', () => {
  test('should display bookmarks with edit buttons', async ({
    personsPage,
  }) => {
    // Open person's tagged bookmarks
    await openPersonCard(personsPage, TEST_PERSONS.DONALD);
    await personsPage.waitForTimeout(500);

    // Verify edit buttons are visible on bookmarks
    const editButtons = personsPage.getByTitle('Edit Bookmark');
    await expect(editButtons.first()).toBeVisible();

    // Navigate back
    await navigateBack(personsPage);
  });
});

test.describe('Toggle Recency', () => {
  test('should verify recency switch exists', async ({ personsPage }) => {
    await personsPage.waitForTimeout(500);

    // Verify recency toggle switch exists in the header
    const recencySwitch = personsPage.getByRole('switch', {
      name: 'Recency',
    });
    const count = await recencySwitch.count();
    expect(count).toBeGreaterThan(0);

    // Get person names in current order before toggle
    const personCardsBefore = personsPage.locator('[data-person-uid]');
    const personCount = await personCardsBefore.count();
    const personNamesBefore: string[] = [];
    for (let i = 0; i < personCount; i++) {
      const text = await personCardsBefore.nth(i).textContent();
      if (text) {
        personNamesBefore.push(text.trim());
      }
    }

    // Toggle the recency switch (click on label instead of hidden input)
    const recencyLabel = personsPage
      .locator('label')
      .filter({ hasText: 'Recency' });
    await recencyLabel.click();

    // Wait for reordering to complete
    await personsPage.waitForTimeout(500);

    // Get person names in new order after toggle
    const personCardsAfter = personsPage.locator('[data-person-uid]');
    const personNamesAfter: string[] = [];
    for (let i = 0; i < personCount; i++) {
      const text = await personCardsAfter.nth(i).textContent();
      if (text) {
        personNamesAfter.push(text.trim());
      }
    }

    // Verify the order has changed
    expect(personNamesBefore).not.toEqual(personNamesAfter);

    // Toggle back to restore original state for other tests
    await recencyLabel.click();
    await personsPage.waitForTimeout(500);
  });
});

test.describe('Person Count Display', () => {
  test('should display correct person count in header', async ({
    personsPage,
  }) => {
    // Count all visible person cards
    const personCount = await personsPage.locator('[data-person-uid]').count();
    expect(personCount).toBeGreaterThan(0);

    // Verify count is displayed in the header
    const countText = (await personsPage.locator('body').textContent()) ?? '';
    expect(countText).toContain(personCount.toString());
  });
});

test.describe('Navigate Between Persons', () => {
  test('should navigate between multiple persons', async ({ personsPage }) => {
    // Open first person's bookmarks
    await openPersonCard(personsPage, TEST_PERSONS.JOHN_NATHAN);
    await personsPage.waitForTimeout(500);

    // Verify badge is visible
    const johnBadge = personsPage
      .locator('.mantine-Badge-label')
      .filter({ hasText: TEST_PERSONS.JOHN_NATHAN });
    await expect(johnBadge).toBeVisible();

    // Navigate back
    await navigateBack(personsPage);

    // Open second person's bookmarks
    await openPersonCard(personsPage, TEST_PERSONS.AKASH_KUMAR_SINGH);
    await personsPage.waitForTimeout(500);

    // Verify second badge is visible
    const akashBadge = personsPage
      .locator('.mantine-Badge-label')
      .filter({ hasText: TEST_PERSONS.AKASH_KUMAR_SINGH });
    await expect(akashBadge).toBeVisible();

    // Navigate back
    await navigateBack(personsPage);

    // Verify person card is still visible
    const johnCard = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: TEST_PERSONS.JOHN_NATHAN });
    await expect(johnCard).toBeVisible();
  });
});
