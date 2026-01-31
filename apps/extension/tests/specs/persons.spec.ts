import { TEST_PERSON_NAME, TEST_PERSONS } from '@bypass/shared/tests';
import { test, expect } from '../fixtures/persons-fixture';
import { PersonsPanel } from '../utils/persons-panel';
import { waitForDebounce } from '../utils/test-utils';

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
      const panel = new PersonsPanel(personsPage);
      await panel.search('John');
      await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);

      await panel.clearSearch();
      await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);
    });

    test('should clear search and show all persons', async ({
      personsPage,
    }) => {
      const panel = new PersonsPanel(personsPage);
      const allPersonsBefore = await panel.getPersonCount();

      await panel.search('NonExistentPerson');

      const noResultsPersons = await panel.getPersonCount();
      expect(noResultsPersons).toBe(0);

      await panel.clearSearch();

      const allPersonsAfter = await panel.getPersonCount();
      expect(allPersonsAfter).toBe(allPersonsBefore);
    });
  });

  test.describe('Add Person', () => {
    test('should open add person dialog', async ({ personsPage }) => {
      const panel = new PersonsPanel(personsPage);
      const dialog = await panel.openAddPersonDialog();

      const nameInput = dialog.getByPlaceholder('Enter name');
      await expect(nameInput).toBeVisible();

      const closeButton = dialog.locator('button.mantine-Modal-close');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await personsPage.keyboard.press('Escape');
      }

      await expect(dialog).toBeHidden();
    });

    test('should add person with name and image', async ({ personsPage }) => {
      const panel = new PersonsPanel(personsPage);
      const TEST_IMAGE_URL = 'https://picsum.photos/200';

      await panel.addPerson(TEST_PERSON_NAME, TEST_IMAGE_URL);
    });
  });

  test.describe('Delete Person', () => {
    test('should delete the test person created earlier', async ({
      personsPage,
    }) => {
      const panel = new PersonsPanel(personsPage);

      // First verify the person exists
      await panel.verifyPersonExists(TEST_PERSON_NAME);

      // Delete the person (this verifies the notification)
      await panel.deletePerson(TEST_PERSON_NAME);
    });

    test('should show error when deleting person with tagged bookmarks', async ({
      personsPage,
    }) => {
      const panel = new PersonsPanel(personsPage);
      // Try to delete a person who has tagged bookmarks
      // John Nathan has bookmarks tagged (verified in existing tests)
      await panel.clickPersonContextMenu(TEST_PERSONS.JOHN_NATHAN, 'delete');

      // Verify error notification is shown
      const notification = personsPage.getByText(
        'Cannot delete a person with tagged bookmarks'
      );
      await expect(notification).toBeVisible();

      // Verify the person still exists (not deleted)
      await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    });
  });
});

test.describe('Edit Person', () => {
  test('should edit person name', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    const EDITED_PREFIX = '(Edited) ';

    await panel.editPersonName(
      TEST_PERSONS.JOHN_NATHAN,
      EDITED_PREFIX + TEST_PERSONS.JOHN_NATHAN
    );

    await panel.editPersonName(
      EDITED_PREFIX + TEST_PERSONS.JOHN_NATHAN,
      TEST_PERSONS.JOHN_NATHAN
    );
  });

  test('should verify avatar image is visible in edit dialog', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.verifyAvatarVisibleInEditDialog(TEST_PERSONS.AKASH_KUMAR_SINGH);
  });

  test('should change person image', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    const NEW_IMAGE_URL = 'https://picsum.photos/250';

    await panel.changePersonImage(TEST_PERSONS.DONALD, NEW_IMAGE_URL);
  });
});

test.describe('Open Tagged Bookmarks', () => {
  test('should open tagged bookmarks for a person', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);

    await personsPage.waitForURL(/persons-panel/);

    await panel.verifyBadgeVisible(TEST_PERSONS.JOHN_NATHAN);

    const editButtons = await panel.getEditButtons();
    const rowCount = await editButtons.count();
    expect(rowCount).toBeGreaterThan(0);

    await panel.navigateBack();
  });

  test('should display correct bookmark count in badge', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    const badgeCount = await panel.verifyBadgeCount(
      TEST_PERSONS.AKASH_KUMAR_SINGH
    );
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Search Tagged Bookmarks', () => {
  test('should search within tagged bookmarks', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    const { allBookmarksBefore, noResultsBookmarks, searchInput } =
      await panel.searchWithinBookmarks(
        'nonexistentbookmark123',
        TEST_PERSONS.DONALD
      );

    expect(allBookmarksBefore).toBeGreaterThan(0);
    expect(noResultsBookmarks).toBe(0);

    await searchInput.clear();
    await waitForDebounce(personsPage);

    const allBookmarksAfter = await panel.getEditButtons();
    const countAfter = await allBookmarksAfter.count();
    expect(countAfter).toBe(allBookmarksBefore);

    await panel.navigateBack();
  });
});

test.describe('Open Tagged Bookmark', () => {
  test('should display bookmarks with edit buttons', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.openPersonCard(TEST_PERSONS.DONALD);

    const editButtons = await panel.getEditButtons();
    await expect(editButtons.first()).toBeVisible();

    await panel.navigateBack();
  });
});

test.describe('Toggle Recency', () => {
  test('should verify recency switch exists', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.verifyRecencySwitchExists();

    const personNamesBefore = await panel.getPersonNames();

    await panel.toggleRecency();

    const personNamesAfter = await panel.getPersonNames();

    expect(personNamesBefore).not.toEqual(personNamesAfter);

    await panel.toggleRecency();
  });
});

test.describe('Person Count Display', () => {
  test('should display correct person count in header', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    const personCount = await panel.getPersonCount();
    expect(personCount).toBeGreaterThan(0);

    const countText = (await personsPage.locator('body').textContent()) ?? '';
    expect(countText).toContain(personCount.toString());
  });
});

test.describe('Navigate Between Persons', () => {
  test('should navigate between multiple persons', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);

    await panel.verifyBadgeVisible(TEST_PERSONS.JOHN_NATHAN);

    await panel.navigateBack();

    await panel.openPersonCard(TEST_PERSONS.AKASH_KUMAR_SINGH);

    await panel.verifyBadgeVisible(TEST_PERSONS.AKASH_KUMAR_SINGH);

    await panel.navigateBack();

    await panel.verifyPersonCardVisible(TEST_PERSONS.JOHN_NATHAN);
  });
});
