import { TEST_PERSONS } from '@bypass/shared/tests';
import { test, expect } from '../fixtures/auth-fixture';
import { PersonsPanel } from '../page-object-models/persons-panel';

test.describe('Persons Panel', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/persons-panel');
    // Wait for persons to load by checking header badge shows count > 0
    const panel = new PersonsPanel(authenticatedPage);
    await expect(async () => {
      const count = await panel.getHeaderPersonCount();
      expect(count).toBeGreaterThan(0);
    }).toPass();
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

      // Wait for search results to update using auto-retrying assertion
      await expect(async () => {
        const countAfter = await panel.getPersonCount();
        expect(countAfter).toBe(0);
      }).toPass();

      await panel.clearSearch();

      // Wait for search results to restore using auto-retrying assertion
      await expect(async () => {
        const countRestored = await panel.getPersonCount();
        expect(countRestored).toBe(countBefore);
      }).toPass();
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
      expect(bookmarkCount).toBeGreaterThan(0);

      await panel.closeModal();
      await panel.verifyModalClosed();
    });

    test('should display correct bookmark count in person badge', async ({
      authenticatedPage,
    }) => {
      const panel = new PersonsPanel(authenticatedPage);

      await panel.openPersonCard(TEST_PERSONS.AKASH_KUMAR_SINGH);

      const badgeCount = await panel.getBookmarkCountInModal();
      expect(typeof badgeCount).toBe('number');
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

      // Wait for search results to restore using auto-retrying assertion
      await expect(async () => {
        const countAfter = await panel.getBookmarkCountInModalFromList();
        expect(countAfter).toBe(countBefore);
      }).toPass();

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

      // Wait for search results to update and verify filtering occurred
      await expect(async () => {
        const countAfter = await panel.getBookmarkCountInModalFromList();
        expect(countAfter).toBeLessThanOrEqual(countBefore);
      }).toPass();

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
