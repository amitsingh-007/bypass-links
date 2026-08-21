import {
  TEST_PERSONS,
  fillSearchInput,
  clearSearchInput,
} from '@bypass/shared/tests';

import { test, expect } from '../fixtures/auth-fixture';
import { PersonsPanel } from '../page-object-models/persons-panel';

test.describe('Persons Panel', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/persons-panel');
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

    await expect(panel.getSearchInput()).toBeVisible();

    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);
    await panel.verifyPersonExists(TEST_PERSONS.DONALD);

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

    await fillSearchInput(authenticatedPage, 'John');
    await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyPersonNotVisible(TEST_PERSONS.AKASH_KUMAR_SINGH);

    await clearSearchInput(authenticatedPage);
    await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);

    await fillSearchInput(authenticatedPage, 'NonExistentPerson123');
    await expect(async () => {
      const countAfter = await panel.getPersonCount();
      expect(countAfter).toBe(0);
    }).toPass();

    await clearSearchInput(authenticatedPage);
    await expect(async () => {
      const countRestored = await panel.getPersonCount();
      expect(countRestored).toBe(countBefore);
    }).toPass();
  });

  test('should open person cards, display bookmark counts and folder badges', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
    await panel.verifyModalVisible();
    await panel.verifyPersonNameInBadge(TEST_PERSONS.JOHN_NATHAN);

    const bookmarkCount = await panel.getBookmarkCountInModal();
    expect(bookmarkCount).toBeGreaterThan(0);

    const folderBadges = panel.getFolderBadges();
    const folderCount = await folderBadges.count();
    expect(folderCount).toBeGreaterThan(0);

    await panel.closeModal();
    await panel.verifyModalClosed();

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

    await test.step(`${TEST_PERSONS.DONALD}: unknown query yields no results`, async () => {
      await panel.openPersonCard(TEST_PERSONS.DONALD);
      const countBefore = await panel.getBookmarkCountInModalFromList();
      expect(countBefore).toBeGreaterThan(0);

      await panel.searchWithinBookmarks('nonexistentbookmark123');
      await expect(panel.getNoBookmarksMessage()).toBeVisible();

      await panel.clearSearchWithinBookmarks();
      await expect(async () => {
        const countAfter = await panel.getBookmarkCountInModalFromList();
        expect(countAfter).toBe(countBefore);
      }).toPass();

      await panel.closeModal();
    });

    await test.step(`${TEST_PERSONS.JOHN_NATHAN}: query narrows the list`, async () => {
      await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
      const countBefore = await panel.getBookmarkCountInModalFromList();
      expect(countBefore).toBeGreaterThan(0);

      await panel.searchWithinBookmarks('React');
      await expect(async () => {
        const countAfter = await panel.getBookmarkCountInModalFromList();
        expect(countAfter).toBeLessThanOrEqual(countBefore);
      }).toPass();

      await panel.clearSearchWithinBookmarks();
      await panel.closeModal();
    });
  });

  test('should navigate between multiple persons and back to list', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    await test.step('open and close a person card', async () => {
      await panel.openPersonCard(TEST_PERSONS.JOHN_NATHAN);
      await panel.verifyModalVisible();
      await panel.closeModal();
      await panel.verifyModalClosed();
    });

    await test.step('lands back on the persons list', async () => {
      await expect(panel.getSearchInput()).toBeVisible();
      await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
    });

    await test.step('open each person in turn', async () => {
      for (const person of [
        TEST_PERSONS.JOHN_NATHAN,
        TEST_PERSONS.AKASH_KUMAR_SINGH,
      ]) {
        await panel.openPersonCard(person);
        await panel.verifyPersonNameInBadge(person);
        await panel.closeModal();
        await panel.verifyModalClosed();
      }
    });

    await test.step('both persons remain listed', async () => {
      await panel.verifyPersonExists(TEST_PERSONS.JOHN_NATHAN);
      await panel.verifyPersonExists(TEST_PERSONS.AKASH_KUMAR_SINGH);
    });
  });

  test('should toggle recency switch and verify person order changes', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);

    await panel.verifyRecencySwitchExists();

    const personNamesBefore = await panel.getPersonNames();
    expect(personNamesBefore.length).toBeGreaterThan(0);

    await panel.toggleRecency();

    const personNamesAfter = await panel.getPersonNames();

    expect(personNamesBefore).not.toEqual(personNamesAfter);

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
  /**
   * `test.use({ viewport })` cannot drive this: the auth fixture supplies its
   * own persistent context, so Playwright's viewport option is ignored and the
   * page would stay wide. Resizing the page itself is what crosses the
   * breakpoint, dropping the grid from five columns to three.
   */
  test('should drop grid columns on a narrow viewport', async ({
    authenticatedPage,
  }) => {
    const panel = new PersonsPanel(authenticatedPage);
    // Columns, not rows: min(persons, 5) against min(persons, 3) always drops,
    // where row counts tie at exactly six persons
    const countRenderedColumns = async () => {
      const offsets = await panel
        .getPersonItems()
        .evaluateAll((cards) =>
          cards.map((card) => Math.round(card.getBoundingClientRect().x))
        );
      return new Set(offsets).size;
    };

    expect(
      await panel.getPersonCount(),
      'the grid needs more than three persons to drop a column when narrowed'
    ).toBeGreaterThan(3);

    // Settles on a full row, not the first card to land
    await expect.poll(countRenderedColumns).toBeGreaterThan(3);
    const wideColumns = await countRenderedColumns();

    await authenticatedPage.setViewportSize({ width: 700, height: 900 });

    await expect.poll(countRenderedColumns).toBeLessThan(wideColumns);
  });
});
