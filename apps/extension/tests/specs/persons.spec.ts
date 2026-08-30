import {
  TEST_PERSON_NAME,
  TEST_PERSONS,
  clearSearchInput,
  closeDialog,
  fillSearchInput,
} from '@bypass/shared/tests';

import { personsTest as test, expect } from '../fixtures/panel-fixture';
import { PersonsPanel } from '../utils/persons-panel';

test.describe('Persons Panel', () => {
  const TEST_IMAGE_DATA_URL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgN0m4ZUAAAAASUVORK5CYII=';

  test('should search, filter, and clear persons', async ({ personsPage }) => {
    const panel = new PersonsPanel(personsPage);

    await clearSearchInput(personsPage);

    const allPersonsBefore = await panel.getPersonCount();
    expect(allPersonsBefore).toBeGreaterThan(0);

    await fillSearchInput(personsPage, 'John');
    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);

    await clearSearchInput(personsPage);
    await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);

    await fillSearchInput(personsPage, 'NonExistentPerson');
    await expect
      .poll(async () => panel.getPersonCount(), { timeout: 10_000 })
      .toBe(0);

    await clearSearchInput(personsPage);
    await expect
      .poll(async () => panel.getPersonCount(), { timeout: 10_000 })
      .toBe(allPersonsBefore);
  });

  test('should create, rename, update, and delete a person', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    const personName = `${TEST_PERSON_NAME}-${Date.now()}`;
    const editedName = `(Edited) ${personName}`;

    await test.step('should open add person dialog', async () => {
      const dialog = await panel.openAddPersonDialog();
      await expect(dialog.getByPlaceholder('Enter name')).toBeVisible();
      await closeDialog(personsPage, dialog);
      await expect(dialog).toBeHidden();
    });

    await test.step('should add person with name and image', async () => {
      await panel.addPerson(personName, TEST_IMAGE_DATA_URL);
      await panel.verifyPersonExists(personName);
    });

    await test.step('should edit person name', async () => {
      await panel.editPersonName(personName, editedName);
    });

    await test.step('should verify avatar image is visible in edit dialog', async () => {
      await panel.verifyAvatarVisibleInEditDialog(editedName);
    });

    await test.step('should change person image', async () => {
      await panel.changePersonImage(editedName, TEST_IMAGE_DATA_URL);
    });

    await test.step('should delete the test person created earlier', async () => {
      await panel.deletePerson(editedName);
    });
  });

  test('should show error when deleting person with tagged bookmarks', async ({
    personsPage,
  }) => {
    const panel = new PersonsPanel(personsPage);
    // John Nathan has tagged bookmarks in the fixture data
    await panel.clickPersonContextMenu(TEST_PERSONS.JOHN_NATHAN, 'delete');

    const notification = personsPage.getByText(
      'Cannot delete a person with tagged bookmarks'
    );
    await expect(notification).toBeVisible();

    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
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
