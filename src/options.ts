export type BreezifyOptions = {
  buildDir?: string;
  cssFilePattern?: RegExp;
  jsFilePattern?: RegExp;
  htmlFilePattern?: RegExp;
  ignoreJsStringPatterns?: RegExp[];
  ignoreClassPatterns?: RegExp[];
  generateCssSourceMap?: boolean;
};
