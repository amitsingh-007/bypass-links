import { clearServiceWorkerCache } from '../../utils/cache';
import { goOffline, goOnline } from '../../utils/network';

const assertOffline = () => {
  return cy.wrap(window).its('navigator.onLine').should('be.false');
};

describe.skip('Homepage UI Tests when Offline', () => {
  before(() => {
    cy.visit('/', {
      onLoad: clearServiceWorkerCache,
    });
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.reload(true);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
  });
  // beforeEach(() => {
  //   goOnline();
  // });
  // afterEach(() => {
  //   goOnline();
  // });

  it('should have required assets available in offline mode', () => {
    // assertExtensionDownload();

    goOffline();

    assertOffline();

    fetch('https://jsonplaceholder.typicode.com/todos/1');

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(8000);

    // cy.reload();

    cy.verifyExtensionDownload();

    goOnline();
  });
});
