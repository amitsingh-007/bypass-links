describe('Homepage UI Tests when Online', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have valid h1 tag', () => {
    cy.get('h1').should(
      'have.text',
      'Have a Link Bypasser and private Bookmarks Panel !'
    );
  });

  it('should download extension file on download button click', () => {
    cy.verifyExtensionDownload();
  });
});
