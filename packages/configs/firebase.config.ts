export const getFirebasePublicConfig = (isProd: boolean) => {
  if (isProd) {
    return {
      apiKey: 'AIzaSyDiMRlBhW36sLjEADoQj9T5L1H-hIDUAso',
      authDomain: 'bypass-links.firebaseapp.com',
      databaseURL: 'https://bypass-links.firebaseio.com/',
      projectId: 'bypass-links',
      storageBucket: 'bypass-links.appspot.com',
      messagingSenderId: '603462573180',
      appId: '1:603462573180:web:317c7f02f1f66b836f3df9',
    };
  }
  return {
    apiKey: 'AIzaSyAIg4tqC2aIFHWOkPMTXVF7jDEnqE9XvgY',
    authDomain: 'bypass-links-dev.firebaseapp.com',
    databaseURL: 'https://bypass-links-dev-default-rtdb.firebaseio.com',
    projectId: 'bypass-links-dev',
    storageBucket: 'bypass-links-dev.appspot.com',
    messagingSenderId: '824508694893',
    appId: '1:824508694893:web:9721695f963b4b6ac85a64',
  };
};
