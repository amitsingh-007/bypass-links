import { test, expect } from '../fixtures/persons-fixture';
import { TEST_PERSONS } from '../constants';
import {
  changeImageInDialog,
  clickDialogButton,
  closeDialog,
  countElements,
  fillDialogInput,
  getBadgeCount,
  navigateBack,
  openDialog,
  openPersonCard,
  rightClickAndSelectOption,
  searchAndVerify,
  toggleSwitch,
  waitForDebounce,
} from '../utils/test-utils';

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
      await searchAndVerify(personsPage, 'John', {
        visibleTexts: [TEST_PERSONS.JOHN_NATHAN],
        hiddenTexts: [TEST_PERSONS.AKASH_KUMAR_SINGH],
      });

      const searchInput = personsPage.getByPlaceholder('Search');
      await searchInput.clear();
      await waitForDebounce(personsPage);
      await expect(
        personsPage
          .locator('[data-person-uid]')
          .filter({ hasText: TEST_PERSONS.AKASH_KUMAR_SINGH })
      ).toBeVisible();
    });

    test('should clear search and show all persons', async ({
      personsPage,
    }) => {
      const searchInput = personsPage.getByPlaceholder('Search');
      const allPersonsBefore = await countElements(
        personsPage,
        '[data-person-uid]'
      );

      await searchInput.fill('NonExistentPerson');
      await waitForDebounce(personsPage);

      const noResultsPersons = await countElements(
        personsPage,
        '[data-person-uid]'
      );
      expect(noResultsPersons).toBe(0);

      await searchInput.clear();
      await waitForDebounce(personsPage);

      const allPersonsAfter = await countElements(
        personsPage,
        '[data-person-uid]'
      );
      expect(allPersonsAfter).toBe(allPersonsBefore);
    });
  });

  test.describe('Add Person', () => {
    test('should open add person dialog', async ({ personsPage }) => {
      const dialog = await openDialog(personsPage, 'Add', 'Add Person');

      const nameInput = dialog.getByPlaceholder('Enter name');
      await expect(nameInput).toBeVisible();

      await closeDialog(personsPage, dialog);
    });

    test('should add person with name and image', async ({ personsPage }) => {
      const TEST_PERSON_NAME = 'E2E Test Person';
      const TEST_IMAGE_URL = 'https://picsum.photos/200';

      const dialog = await openDialog(personsPage, 'Add', 'Add Person');
      await fillDialogInput(dialog, 'Enter name', TEST_PERSON_NAME);
      await changeImageInDialog(personsPage, dialog, TEST_IMAGE_URL);
      await clickDialogButton(dialog, 'Save');
      await expect(dialog).toBeHidden();

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

    await rightClickAndSelectOption(
      personsPage,
      '[data-person-uid]',
      TEST_PERSONS.JOHN_NATHAN,
      'Edit'
    );

    const dialog = personsPage.getByRole('dialog', { name: 'Edit Person' });
    await expect(dialog).toBeVisible();

    const nameInput = dialog.getByPlaceholder('Enter name');
    const originalName = await nameInput.inputValue();
    expect(originalName).toBe(TEST_PERSONS.JOHN_NATHAN);

    await nameInput.fill(EDITED_PREFIX + TEST_PERSONS.JOHN_NATHAN);

    await clickDialogButton(dialog, 'Save');
    await expect(dialog).toBeHidden();

    const editedJohnCard = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: EDITED_PREFIX + TEST_PERSONS.JOHN_NATHAN });
    await expect(editedJohnCard).toBeVisible();

    await rightClickAndSelectOption(
      personsPage,
      '[data-person-uid]',
      EDITED_PREFIX + TEST_PERSONS.JOHN_NATHAN,
      'Edit'
    );

    const dialog2 = personsPage.getByRole('dialog', { name: 'Edit Person' });
    await expect(dialog2).toBeVisible();

    const nameInput2 = dialog2.getByPlaceholder('Enter name');
    await nameInput2.fill(TEST_PERSONS.JOHN_NATHAN);

    await clickDialogButton(dialog2, 'Save');
    await expect(dialog2).toBeHidden();

    const revertedJohnCard = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: TEST_PERSONS.JOHN_NATHAN });
    await expect(revertedJohnCard).toBeVisible();
  });

  test('should verify avatar image is visible in edit dialog', async ({
    personsPage,
  }) => {
    await rightClickAndSelectOption(
      personsPage,
      '[data-person-uid]',
      TEST_PERSONS.AKASH_KUMAR_SINGH,
      'Edit'
    );

    const dialog = personsPage.getByRole('dialog', { name: 'Edit Person' });
    await expect(dialog).toBeVisible();

    const avatar = dialog.locator('img');
    await expect(avatar).toBeVisible();

    await closeDialog(personsPage, dialog);
  });

  test('should change person image', async ({ personsPage }) => {
    const NEW_IMAGE_URL = 'https://picsum.photos/250';

    await rightClickAndSelectOption(
      personsPage,
      '[data-person-uid]',
      TEST_PERSONS.DONALD,
      'Edit'
    );

    const dialog = personsPage.getByRole('dialog', { name: 'Edit Person' });
    await expect(dialog).toBeVisible();

    await changeImageInDialog(personsPage, dialog, NEW_IMAGE_URL);

    await clickDialogButton(dialog, 'Save');
    await expect(dialog).toBeHidden();

    const donaldCardAfter = personsPage
      .locator('[data-person-uid]')
      .filter({ hasText: TEST_PERSONS.DONALD });
    await expect(donaldCardAfter).toBeVisible();
  });
});

test.describe('Open Tagged Bookmarks', () => {
  test('should open tagged bookmarks for a person', async ({ personsPage }) => {
    await openPersonCard(personsPage, TEST_PERSONS.JOHN_NATHAN);

    await personsPage.waitForURL(/persons-panel/);

    const headerBadge = personsPage
      .locator('.mantine-Badge-label')
      .filter({ hasText: TEST_PERSONS.JOHN_NATHAN });
    await expect(headerBadge).toBeVisible();

    const badgeText = (await headerBadge.textContent()) ?? '';
    expect(badgeText).toContain(TEST_PERSONS.JOHN_NATHAN);

    const editButtons = personsPage.getByTitle('Edit Bookmark');
    const rowCount = await editButtons.count();
    expect(rowCount).toBeGreaterThan(0);

    await navigateBack(personsPage);
  });

  test('should display correct bookmark count in badge', async ({
    personsPage,
  }) => {
    await openPersonCard(personsPage, TEST_PERSONS.AKASH_KUMAR_SINGH);
    await personsPage.waitForTimeout(500);

    const badgeCount = await getBadgeCount(
      personsPage,
      TEST_PERSONS.AKASH_KUMAR_SINGH
    );
    expect(badgeCount).toBeGreaterThanOrEqual(0);

    const editButtons = personsPage.getByTitle('Edit Bookmark');
    const actualCount = await editButtons.count();
    expect(actualCount).toBe(badgeCount);

    await navigateBack(personsPage);
  });
});

test.describe('Search Tagged Bookmarks', () => {
  test('should search within tagged bookmarks', async ({ personsPage }) => {
    await openPersonCard(personsPage, TEST_PERSONS.DONALD);
    await personsPage.waitForTimeout(500);

    const searchInput = personsPage
      .locator('.mantine-Modal-content')
      .getByPlaceholder('Search');

    const allBookmarksBefore = await personsPage
      .getByTitle('Edit Bookmark')
      .count();
    expect(allBookmarksBefore).toBeGreaterThan(0);

    await searchInput.fill('nonexistentbookmark123');
    await waitForDebounce(personsPage);

    const noResultsBookmarks = await personsPage
      .getByTitle('Edit Bookmark')
      .count();
    expect(noResultsBookmarks).toBe(0);

    await searchInput.clear();
    await waitForDebounce(personsPage);

    const allBookmarksAfter = await personsPage
      .getByTitle('Edit Bookmark')
      .count();
    expect(allBookmarksAfter).toBe(allBookmarksBefore);

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

    const recencySwitch = personsPage.getByRole('switch', {
      name: 'Recency',
    });
    const count = await recencySwitch.count();
    expect(count).toBeGreaterThan(0);

    const personCardsBefore = personsPage.locator('[data-person-uid]');
    const personCount = await personCardsBefore.count();
    const personNamesBefore: string[] = [];
    for (let i = 0; i < personCount; i++) {
      const text = await personCardsBefore.nth(i).textContent();
      if (text) {
        personNamesBefore.push(text.trim());
      }
    }

    await toggleSwitch(personsPage, 'Recency');

    const personCardsAfter = personsPage.locator('[data-person-uid]');
    const personNamesAfter: string[] = [];
    for (let i = 0; i < personCount; i++) {
      const text = await personCardsAfter.nth(i).textContent();
      if (text) {
        personNamesAfter.push(text.trim());
      }
    }

    expect(personNamesBefore).not.toEqual(personNamesAfter);

    await toggleSwitch(personsPage, 'Recency');
  });
});

test.describe('Person Count Display', () => {
  test('should display correct person count in header', async ({
    personsPage,
  }) => {
    const personCount = await countElements(personsPage, '[data-person-uid]');
    expect(personCount).toBeGreaterThan(0);

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
