export const assertExtensionDownload = () => {
  cy.get(`[data-test-attr="ext-download-button"]`)
    .should("have.attr", "href")
    .and(
      "match",
      /https:\/\/github\.com\/amitsingh-007\/bypass-links\/releases\/download\/.*\.zip/
    );
};
