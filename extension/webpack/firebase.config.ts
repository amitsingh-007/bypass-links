import glob from 'glob';
import { merge } from 'webpack-merge';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { DllPlugin, Configuration } from 'webpack';
import commonConfig from './common.config';
import { PATHS } from './constants';

/**
 * This will generate a common chunk  of all the files inside ./src/helpers/firebase for background and content scripts webpack build
 */
const firebaseDllConfig = merge<Configuration>(commonConfig, {
  name: 'firebase-dll',
  entry: glob.sync('./src/helpers/firebase/*.ts'),
  output: {
    filename: 'js/firebase.dll.js',
    path: PATHS.EXTENSION,
    library: 'firebase_lib',
  },
  plugins: [
    new DllPlugin({
      name: 'firebase_lib',
      path: `${PATHS.FIREBASE}/manifest.json`,
    }),
    new CleanWebpackPlugin(),
  ],
});

export default firebaseDllConfig;
