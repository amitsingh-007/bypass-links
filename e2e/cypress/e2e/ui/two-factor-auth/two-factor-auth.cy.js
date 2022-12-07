import { authenticator } from 'otplib';

const isProd = process.env.CYPRESS_NODE_ENV === 'Production';

const uid = isProd
  ? 'LmUG7m0hT1cfbnJiO0JvAJhdL5O2'
  : '0zwHh3AUKrby6uIV2tKzArDXy243';

describe('Two Factor Auth Setup Flow', () => {
  let secretKey, otpAuthUrl;

  it('should show not setup for a new user', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/status?uid=${uid}`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        is2FAEnabled: false,
      });
    });
  });

  it('should create new totp for the first time', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/setup?uid=${uid}`,
    }).then((response) => {
      expect(response.status).to.be.equal(200);
      expect(response.body).to.have.property('secretKey');
      expect(response.body).to.have.property('otpAuthUrl');

      secretKey = response.body.secretKey;
      otpAuthUrl = response.body.otpAuthUrl;
    });
  });

  it('should return already created totp if requested to setup again', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/setup?uid=${uid}`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        secretKey,
        otpAuthUrl,
      });
    });
  });

  it('should still show totp not setup after setup step', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/status?uid=${uid}`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        is2FAEnabled: false,
      });
    });
  });

  it('should not verify if user enters wrong totp token', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/verify?uid=${uid}&totp=791543`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        isVerified: false,
      });
    });
  });

  it('should verify if user enters correct totp token', () => {
    const token = authenticator.generate(secretKey);
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/verify?uid=${uid}&totp=${token}`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        isVerified: true,
      });
    });
  });

  it('should show totp as setup after successfully verifying', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/status?uid=${uid}`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        is2FAEnabled: true,
      });
    });
  });

  it('should not authenticate the user if wrong totp token is entered', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/authenticate?uid=${uid}&totp=128945`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        isVerified: false,
      });
    });
  });

  it('should authenticate the user if correct totp token is entered', () => {
    const token = authenticator.generate(secretKey);
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/authenticate?uid=${uid}&totp=${token}`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        isVerified: true,
      });
    });
  });

  it('should revoke the totp status', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/revoke?uid=${uid}`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        isRevoked: true,
      });
    });
  });

  it('should show totp not setup after being revoked', () => {
    cy.request({
      method: 'GET',
      url: `api/2fa-auth/status?uid=${uid}`,
    }).then((response) => {
      expect(response.body).to.deep.equal({
        is2FAEnabled: false,
      });
    });
  });
});
