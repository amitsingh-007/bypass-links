import { assertExtensionDownload } from "./common";

describe("Homepage UI Tests when Online", () => {
  before(() => {
    cy.visit("/");
  });

  it("should have valid h1 tag", () => {
    cy.get("h1").should(
      "have.text",
      "Have a Link Bypasser and private Bookmarks Panel !"
    );
  });

  it("should download extension file on download button click", () => {
    assertExtensionDownload();
  });
});
