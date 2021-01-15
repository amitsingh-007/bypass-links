describe("Homepage UI Tests", () => {
  before(() => {
    cy.visit("/");
  });

  it("should have valid h1 tag", () => {
    cy.get("h1").should("have.text", "Welcome to Bypass Links");
  });

  it("should download extension file on download button click", () => {
    cy.get(`[data-test-id="extension-download-button"]`)
      .eq(0)
      .as("downloadButton");
    cy.intercept("GET", /\/bypass-links-.*.zip/).as("get");
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
  });
});
