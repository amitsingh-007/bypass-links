import { assertExtensionDownload } from "./common";

describe.skip("Homepage UI Tests when Online", () => {
  before(() => {
    cy.visit("/");
  });

  it("should have valid h1 tag", () => {
    cy.get("h1").should("have.text", "Welcome to Bypass Links");
  });

  it("should download extension file on download button click", () => {
    assertExtensionDownload();
  });
});
