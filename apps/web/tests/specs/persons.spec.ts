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

  test('should navigate to persons panel, display all persons, and verify header count', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    // Verify search input and header
    await expect(panel.getSearchInput()).toBeVisible();

    // Verify all persons are displayed
    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);
    await panel.verifyPersonExists(TEST_PERSONS.DONALD);

    // Verify person count matches header count
    const personCount = await panel.getPersonCount();
    expect(personCount).toBeGreaterThan(0);
    const headerCount = await panel.getHeaderPersonCount();
    expect(headerCount).toBe(personCount);
  });

  test('should search and filter persons by name, including no results', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);
    const countBefore = await panel.getPersonCount();
    expect(countBefore).toBeGreaterThan(0);

    // Search for John and verify filtering
    await panel.search('John');
    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyPersonNotVisible(TEST_PERSONS.AKASH_KUMAR_SINGH);

    // Clear search and verify all shown
    await panel.clearSearch();
    await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);

    // Search for non-existent person
    await panel.search('NonExistentPerson123');
    await expect(async () => {
      const countAfter = await panel.getPersonCount();
      expect(countAfter).toBe(0);
    }).toPass();

    // Clear search and verify count restored
    await panel.clearSearch();
    await expect(async () => {
      const countRestored = await panel.getPersonCount();
      expect(countRestored).toBe(countBefore);
    }).toPass();
  });

  test('should open person cards, display bookmark counts and folder badges', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    // Open John Nathan's card and verify
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyModalVisible();
    await panel.verifyPersonNameInBadge(TEST_PERSONS.JOHN_NATHAN);

    const bookmarkCount = await panel.getBookmarkCountInModal();
    expect(bookmarkCount).toBeGreaterThan(0);

    // Verify folder badges exist
    const folderBadges = panel.getFolderBadges();
    const folderCount = await folderBadges.count();
    expect(folderCount).toBeGreaterThan(0);

    await panel.closeModal();
    await panel.verifyModalClosed();

    // Open Akash's card and verify badge count
    await panel.openPersonCard(TEST_PERSONS.AKASH_KUMAR_SINGH);
    const badgeCount = await panel.getBookmarkCountInModal();
    expect(typeof badgeCount).toBe('number');
    await panel.verifyPersonNameInBadge(TEST_PERSONS.AKASH_KUMAR_SINGH);
    await panel.closeModal();
  });

  test('should search within person bookmarks and filter results', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    // Open Donald's card and search for non-existent bookmark
    await panel.openPersonCard(TEST_PERSONS.DONALD);
    const countBefore = await panel.getBookmarkCountInModalFromList();
    expect(countBefore).toBeGreaterThan(0);

    await panel.searchWithinBookmarks('nonexistentbookmark123');
    const noResultsMessage = panel.getNoBookmarksMessage();
    await expect(noResultsMessage).toBeVisible();

    await panel.clearSearchWithinBookmarks();
    await expect(async () => {
      const countAfter = await panel.getBookmarkCountInModalFromList();
      expect(countAfter).toBe(countBefore);
    }).toPass();

    await panel.closeModal();

    // Open John's card and filter by search
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
    const countBeforeJohn = await panel.getBookmarkCountInModalFromList();
    expect(countBeforeJohn).toBeGreaterThan(0);

    await panel.searchWithinBookmarks('React');
    await expect(async () => {
      const countAfter = await panel.getBookmarkCountInModalFromList();
      expect(countAfter).toBeLessThanOrEqual(countBeforeJohn);
    }).toPass();

    await panel.clearSearchWithinBookmarks();
    await panel.closeModal();
  });

  test('should navigate between multiple persons and back to list', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    // Open John Nathan, verify, and close
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyModalVisible();
    await panel.closeModal();
    await panel.verifyModalClosed();

    // Verify back on persons list
    await expect(panel.getSearchInput()).toBeVisible();
    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);

    // Open multiple persons sequentially
    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyPersonNameInBadge(TEST_PERSONS.JOHN_NATHAN);
    await panel.closeModal();
    await panel.verifyModalClosed();

    await panel.openPersonCard(TEST_PERSONS.AKASH_KUMAR_SINGH);
    await panel.verifyPersonNameInBadge(TEST_PERSONS.AKASH_KUMAR_SINGH);
    await panel.closeModal();
    await panel.verifyModalClosed();

    // Verify both persons still exist on list
    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);
  });

  test('should toggle recency switch and verify person order changes', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    // Verify recency switch exists
    await panel.verifyRecencySwitchExists();

    // Get initial order of persons
    const personNamesBefore = await panel.getPersonNames();
    expect(personNamesBefore.length).toBeGreaterThan(0);

    // Toggle recency switch
    await panel.toggleRecency();

    // Get new order of persons
    const personNamesAfter = await panel.getPersonNames();

    // Verify order changed
    expect(personNamesBefore).not.toEqual(personNamesAfter);

    // Toggle back to restore original order
    await panel.toggleRecency();
    const personNamesRestored = await panel.getPersonNames();
    expect(personNamesRestored).toEqual(personNamesBefore);
  });

  test('should hide edit bookmark buttons in readonly web app', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyEditButtonsHidden();
    await panel.closeModal();
  });
});
