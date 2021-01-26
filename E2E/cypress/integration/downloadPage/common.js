export const assertExtensionDownload = () => {
  cy.get(`[data-test-id="extension-download-button"]`)
    .eq(0)
    .as("downloadButton");
  cy.intercept("GET", "/api/extension/").as("get");
  cy.get("@downloadButton").click();
  cy.get(`[data-test-id="downloaded"`, { timeout: 100000 }).should(
    "have.text",
    "Downloaded"
  );
  cy.get("@get")
    .its("response")
    .then((res) => {
      expect(res.statusCode).to.not.equal(404);
    });
};
