const uid = "4767b7c0ca4c4f21855cgh56";

describe("Two Factor Auth APIs tests", () => {
  describe("setup api", () => {
    let secretKey, otpAuthUrl;

    it("should create new totp for the first time", () => {
      cy.request({
        method: "GET",
        url: `api/2fa-auth/setup?uid=${uid}`,
      }).then((response) => {
        expect(response.status).to.be.equal(200);
        expect(response.body).to.have.property("secretKey");
        expect(response.body).to.have.property("otpAuthUrl");

        secretKey = response.body.secretKey;
        otpAuthUrl = response.body.otpAuthUrl;
      });
    });

    it("should return already created totp if requested to setup again", () => {
      cy.request({
        method: "GET",
        url: `api/2fa-auth/setup?uid=${uid}`,
      }).then((response) => {
        expect(response.body).to.deep.equal({
          secretKey,
          otpAuthUrl,
        });
      });
    });
  });
});
