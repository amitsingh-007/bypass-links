import { clearServiceWorkerCache } from '../../utils/cache';
import { goOffline, goOnline } from '../../utils/network';

const assertOffline = () => {
  return cy.wrap(window).its('navigator.onLine').should('be.false');
};

/**
 * Enable this test after this issue: https://github.com/cypress-io/cypress/issues/17723
 */
describe.skip('Homepage UI Tests when Offline', () => {
  before(() => {
    cy.visit('/', {
      // onLoad: clearServiceWorkerCache,
    });
  });
  beforeEach(() => goOnline());
  afterEach(() => goOnline());

  it(
    'should have required assets available in offline mode',
    { browser: '!firefox' },
    () => {
      // assertExtensionDownload();

      cy.reload(true);

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(8000).then(() => {
        goOffline();
      });

      assertOffline();

      fetch('https://jsonplaceholder.typicode.com/todos/1');

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(8000);

      // cy.reload();

      cy.verifyExtensionDownload();

      goOnline();
    }
  );
});
