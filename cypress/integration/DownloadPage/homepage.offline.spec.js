/* eslint-disable cypress/no-unnecessary-waiting */
import { clearServiceWorkerCache } from "../utils/cache";
import { goOffline, goOnline } from "../utils/network";
import { assertExtensionDownload } from "./common";

const assertOffline = () => {
  return cy.wrap(window).its("navigator.onLine").should("be.false");
};

describe.skip("Homepage UI Tests when Offline", () => {
  before(() => {
    cy.visit("/", {
      onLoad: clearServiceWorkerCache,
    });
    cy.wait(5000);
    cy.reload(true);
    cy.wait(5000);
  });
  // beforeEach(() => {
  //   goOnline();
  // });
  // afterEach(() => {
  //   goOnline();
  // });

  it("should have required assets available in offline mode", () => {
    // assertExtensionDownload();

    goOffline();

    assertOffline();

    fetch("https://jsonplaceholder.typicode.com/todos/1");

    cy.wait(8000);

    // cy.reload();

    assertExtensionDownload();

    goOnline();
  });
});
