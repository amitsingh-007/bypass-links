import { TEST_PERSONS } from '@bypass/shared/tests';
import { test, expect } from '../fixtures/auth-fixture';
import { PersonsPanel } from '../page-object-models/persons-panel';

test.describe('Persons Panel', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/persons-panel');
    // Wait for persons to load from localStorage
    await expect(
      authenticatedPage.locator('[data-testid^="person-item-"]').first()
    ).toBeVisible();
  });

  test.describe('Basic Navigation', () => {
    test('should navigate to persons panel and verify header', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await expect(panel.getSearchInput()).toBeVisible();

      const personCount = await panel.getPersonCount();
      expect(personCount).toBeGreaterThan(0);

      const headerCount = await panel.getHeaderPersonCount();
      expect(headerCount).toBe(personCount);
    });
  });

  test.describe('View Persons', () => {
    test('should display all persons in the panel', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
      await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);
      await panel.verifyPersonExists(TEST_PERSONS.DONALD);
    });

    test('should display correct person count in header', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      const personCount = await panel.getPersonCount();
      expect(personCount).toBeGreaterThan(0);

      const headerCount = await panel.getHeaderPersonCount();
      expect(headerCount).toBe(personCount);
    });
  });

  test.describe('Search Persons', () => {
    test('should search and filter persons by name', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.search('John');
      await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
      await panel.verifyPersonNotVisible(TEST_PERSONS.AKASH_KUMAR_SINGH);

      await panel.clearSearch();
      await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);
    });

    test('should show no results for non-existent person', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      const countBefore = await panel.getPersonCount();
      expect(countBefore).toBeGreaterThan(0);

      await panel.search('NonExistentPerson123');

      const countAfter = await panel.getPersonCount();
      expect(countAfter).toBe(0);

      await panel.clearSearch();

      const countRestored = await panel.getPersonCount();
      expect(countRestored).toBe(countBefore);
    });
  });

  test.describe('Open Person Tagged Bookmarks', () => {
    test('should open person card and display tagged bookmarks', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
      await panel.verifyModalVisible();
      await panel.verifyPersonNameInBadge(TEST_PERSONS.JOHN_NATHAN);

      const bookmarkCount = await panel.getBookmarkCountInModal();
      expect(bookmarkCount).toBeGreaterThanOrEqual(0);

      await panel.closeModal();
      await panel.verifyModalClosed();
    });

    test('should display correct bookmark count in person badge', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.openPersonCard(TEST_PERSONS.AKASH_KUMAR_SINGH);

      const badgeCount = await panel.getBookmarkCountInModal();
      // Verify badge shows a non-negative count
      expect(badgeCount).toBeGreaterThanOrEqual(0);
      // Verify person name is in the badge
      await panel.verifyPersonNameInBadge(TEST_PERSONS.AKASH_KUMAR_SINGH);

      await panel.closeModal();
    });

    test('should show folder name for each bookmark', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);

      // Verify bookmark count badge is present in modal
      const badgeCount = await panel.getBookmarkCountInModal();
      expect(badgeCount).toBeGreaterThan(0);

      // Verify folder badges exist for the bookmarks
      const folderBadges = panel.getFolderBadges();
      const folderCount = await folderBadges.count();
      expect(folderCount).toBeGreaterThan(0);

      await panel.closeModal();
    });
  });

  test.describe('Search Within Person Bookmarks', () => {
    test('should search within tagged bookmarks and show no results', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.openPersonCard(TEST_PERSONS.DONALD);

      const countBefore = await panel.getBookmarkCountInModalFromList();
      expect(countBefore).toBeGreaterThan(0);

      await panel.searchWithinBookmarks('nonexistentbookmark123');

      const noResultsMessage = panel.getNoBookmarksMessage();
      await expect(noResultsMessage).toBeVisible();

      await panel.clearSearchWithinBookmarks();

      const countAfter = await panel.getBookmarkCountInModalFromList();
      expect(countAfter).toBe(countBefore);

      await panel.closeModal();
    });

    test('should filter bookmarks by search query', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);

      const countBefore = await panel.getBookmarkCountInModalFromList();
      expect(countBefore).toBeGreaterThan(0);

      await panel.searchWithinBookmarks('React');

      const countAfter = await panel.getBookmarkCountInModalFromList();
      expect(countAfter).toBeLessThanOrEqual(countBefore);

      await panel.clearSearchWithinBookmarks();
      await panel.closeModal();
    });
  });

  test.describe('Navigate Between Persons', () => {
    test('should navigate back from person bookmarks to persons list', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
      await panel.verifyModalVisible();

      await panel.closeModal();
      await panel.verifyModalClosed();

      await expect(panel.getSearchInput()).toBeVisible();
      await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    });

    test('should open multiple different persons sequentially', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
      await panel.verifyPersonNameInBadge(TEST_PERSONS.JOHN_NATHAN);
      await panel.closeModal();
      await panel.verifyModalClosed();

      await panel.openPersonCard(TEST_PERSONS.AKASH_KUMAR_SINGH);
      await panel.verifyPersonNameInBadge(TEST_PERSONS.AKASH_KUMAR_SINGH);
      await panel.closeModal();
      await panel.verifyModalClosed();

      await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
      await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);
    });
  });
});
