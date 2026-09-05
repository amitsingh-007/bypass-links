import { type UserManifest } from 'wxt';

const OAUTH_SCOPES = ['https://www.googleapis.com/auth/userinfo.email'];

export const prodOAuth2: UserManifest['oauth2'] = {
  client_id:
    '603462573180-fevjvmbth5i8edtbgmsk2h9vo90dnv35.apps.googleusercontent.com',
  scopes: OAUTH_SCOPES,
};

export const devManifest: UserManifest = {
  name: 'Bypass Links',
  key: 'fdnekjijeofacghkammknogmiapepano',
  action: {
    default_icon: {
      32: 'assets/bypass_link_on_32.png',
    },
    default_title: 'Bypass Links',
  },
  icons: {
    128: 'assets/bypass_link_on_128.png',
  },
  oauth2: {
    client_id:
      '824508694893-7dnmhd6c6ge8l7v1a625h15pfr0us2pc.apps.googleusercontent.com',
    scopes: OAUTH_SCOPES,
  },
  permissions: [
    'storage',
    'tabs',
    'history',
    'identity',
    'scripting',
    'webNavigation',
  ],
  host_permissions: ['<all_urls>'],
  content_security_policy: {
    extension_pages: "script-src 'self'",
  },
};
