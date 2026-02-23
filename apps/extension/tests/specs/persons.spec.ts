import {
  TEST_PERSON_NAME,
  TEST_PERSONS,
  clearSearchInput,
  closeDialog,
  fillSearchInput,
} from '@bypass/shared/tests';
import { test, expect } from '../fixtures/persons-fixture';
import { PersonsPanel } from '../utils/persons-panel';

/**
 * Persons Panel E2E Tests
 *
 * These tests run sequentially with a single login at the start.
 * The browser context persists across all tests in this describe block.
 *
 * IMPORTANT: Test order matters! Do not reorder tests without understanding dependencies.
 */
test.describe('Persons Panel', () => {
  const TEST_IMAGE_DATA_URL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgN0m4ZUAAAAASUVORK5CYII=';

  test('should search, filter, and clear persons', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);

    // Ensure we start with cleared search
    await clearSearchInput(personsPage);

    // Get initial count
    const allPersonsBefore = await panel.getPersonCount();
    expect(allPersonsBefore).toBeGreaterThan(0);

    // Search and filter
    await fillSearchInput(personsPage, 'John');
    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);

    // Clear search and verify all persons shown
    await clearSearchInput(personsPage);
    await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);

    // Search for non-existent person
    await fillSearchInput(personsPage, 'NonExistentPerson');
    await expect
      .poll(async () => panel.getPersonCount(), { timeout: 10_000 })
      .toBe(0);

    // Clear and verify count restored
    await clearSearchInput(personsPage);
    await expect
      .poll(async () => panel.getPersonCount(), { timeout: 10_000 })
      .toBe(allPersonsBefore);
  });

  test('should open add person dialog', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    const dialog = await panel.openAddPersonDialog();

    const nameInput = dialog.getByPlaceholder('Enter name');
    await expect(nameInput).toBeVisible();

    await closeDialog(personsPage, dialog);

    await expect(dialog).toBeHidden();
  });

  test('should add person with name and image', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    const TEST_IMAGE_URL = TEST_IMAGE_DATA_URL;

    await panel.addPerson(TEST_PERSON_NAME, TEST_IMAGE_URL);
  });

  test('should delete the test person created earlier', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    const personToDelete = `${TEST_PERSON_NAME}-delete-${Date.now()}`;

    await panel.addPerson(personToDelete, TEST_IMAGE_DATA_URL);

    // First verify the person exists
    await panel.verifyPersonExists(personToDelete);

    // Delete the person (this verifies the notification)
    await panel.deletePerson(personToDelete);
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
    const NEW_IMAGE_URL = TEST_IMAGE_DATA_URL;

    await panel.changePersonImage(TEST_PERSONS.DONALD, NEW_IMAGE_URL);
  });

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
    await panel.ensureAtRoot();
    const badgeCount = await panel.verifyBadgeCount(
      TEST_PERSONS.AKASH_KUMAR_SINGH
    );
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('should search within tagged bookmarks', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.ensureAtRoot();

    const { allBookmarksBefore, noResultsBookmarks, searchInput } =
      await panel.searchWithinBookmarks(
        'nonexistentbookmark123',
        TEST_PERSONS.JOHN_NATHAN
      );
    expect(noResultsBookmarks).toBe(0);

    await searchInput.clear();
    await expect
      .poll(
        async () => {
          const editButtons = await panel.getEditButtons();
          return editButtons.count();
        },
        {
          timeout: 10_000,
        }
      )
      .toBe(allBookmarksBefore);

    await panel.navigateBack();
  });

  test('should display bookmarks with edit buttons', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.ensureAtRoot();
    await panel.openPersonCard(TEST_PERSONS.DONALD);

    const editButtons = await panel.getEditButtons();
    await expect(editButtons.first()).toBeVisible();

    await panel.navigateBack();
  });

  test('should verify recency switch exists', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.ensureAtRoot();

    const recencySwitch = personsPage.getByTestId('recency-switch');
    await expect(recencySwitch).toBeVisible();

    const personNamesBefore = await panel.getPersonNames();

    await recencySwitch.click();
    await expect
      .poll(async () => JSON.stringify(await panel.getPersonNames()))
      .not.toBe(JSON.stringify(personNamesBefore));

    await recencySwitch.click();
  });

  test('should display correct person count in header', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.ensureAtRoot();
    const personCount = await panel.getPersonCount();
    expect(personCount).toBeGreaterThan(0);

    const headerCount = await panel.getHeaderPersonCount();
    expect(headerCount).toBe(personCount);
  });

  test('should navigate between multiple persons', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);

    await panel.verifyBadgeVisible(TEST_PERSONS.JOHN_NATHAN);

    await panel.navigateBack();

    await panel.openPersonCard(TEST_PERSONS.AKASH_KUMAR_SINGH);

    await panel.verifyBadgeVisible(TEST_PERSONS.AKASH_KUMAR_SINGH);

    await panel.navigateBack();

    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
  });
});
