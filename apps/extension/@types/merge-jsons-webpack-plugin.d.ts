declare module 'merge-jsons-webpack-plugin' {
  import { type Compiler, type WebpackPluginInstance } from 'webpack';

  export default class MergeJsonWebpackPlugin implements WebpackPluginInstance {
    constructor(options: object);
    apply(compiler: Compiler): void;
  }
}
