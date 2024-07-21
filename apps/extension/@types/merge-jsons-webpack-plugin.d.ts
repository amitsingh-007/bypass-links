declare module 'merge-jsons-webpack-plugin' {
  import { Compiler, WebpackPluginInstance } from 'webpack';

  export default class MergeJsonWebpackPlugin implements WebpackPluginInstance {
    constructor(options: object);
    apply(compiler: Compiler): void;
  }
}
