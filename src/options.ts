import { SkipRule } from "./js-functions.js";
import { Options } from "html-minifier";
import merge from "lodash.merge";
import { DeepPartial } from "./helpers.js";
import fs from "fs";

/**
 * Options for pretty
 */
interface PrettyOptions {
  ocd: boolean;
}

/**
 * Options for files
 */
export type FilesOptions = {
  /**
   * The directory where the files are located
   * @default "dist"
   */
  buildDir: string;
  /** The directory where the files should be outputted */
  outputDir?: string;
  /**
   * The pattern to match the files relative to build folder. See: {@link https://www.npmjs.com/package/glob}
   * @default `**\/*.{css,js,html}"
   */
  pattern: string;
  /** The RegExp patterns to ignore */
  ignore: string[];
};

/**
 * Options for CSS
 */
export type CSSOptions = {
  /** The RegExp patterns to include. Example: ["^tw-"] for class names with "tw-" prefix */
  includeClassPatterns?: string[];
  /** The RegExp patterns to ignore */
  ignoreClassPatterns?: string[];
  /**
   * Whether to shuffle class names
   * @default true
   */
  shuffle?: boolean;
  /** The prefix to add to the class names */
  prefix?: string;
  /**
   * Whether to minify the output CSS.
   * @default true
   */
  minify?: boolean;
  /**
   * Whether to restructure the CSS with CSSO for maximum compression
   * @default false
   */
  restructure?: boolean;
  /**
   * Whether to force media merge with CSSO
   * @default false
   */
  forceMediaMerge?: boolean;
  /**
   * Whether to extract class names from style tags found in HTML files
   * @default true
   */
  extractClassesFromHtml?: boolean;
};

/**
 * Options for JS
 */
export type JSOptions = {
  /**
   * The RegExp patterns to ignore when replacing class names in strings in JS files
   */
  ignoreStringPatterns?: string[];
  /**
   * Skip rules to ignore certain nodes. Example: (node, ancestors) => node.type === "ImportDeclaration"
   *
   * ESTree docs: {@link https://github.com/estree/estree}
   *
   * Acorn (AST tree builder) docs: {@link https://github.com/acornjs/acorn}
   *
   * Example skip rules: {@link https://github.com/glebgorokhov/breezify/blob/main/src/skip-rules/index.ts}
   */
  skipRules?: SkipRule[];
  /**
   * The mode to use for parsing JS files. "acorn" is recommended for most use cases. "simple" is faster (using RegExp replace) but less accurate.
   * @default "acorn"
   */
  mode?: "acorn" | "simple";
  /**
   * Whether to minify the output JS.
   * @default true
   */
  minify?: boolean;
  /**
   * Whether to minify inline JS (inside HTML files).
   * @default true
   */
  minifyInlineJS?: boolean;
};

export type HTMLOptions = {
  /**
   * The attributes to minify in HTML files
   * @default ["class"]
   */
  attributes: string[];
  /**
   * Whether to beautify the output HTML.
   *
   * Docs: {@link https://www.npmjs.com/package/pretty}
   *
   * @default undefined
   */
  beautify?: boolean | PrettyOptions;
  /**
   * Whether to minify the output HTML. Can be "true" or {@link Options}. If "true" then {@link minifyHtmlDefaultOptions} will be used.
   *
   * See {@link https://www.npmjs.com/package/html-minifier}
   *
   * @default true
   */
  minify?: boolean | Options;
};

/**
 * Options for Breezify
 */
export type BreezifyOptions = {
  /** The path to the Breezify config file */
  config?: string;
  ignoreConfig?: boolean;
  files: FilesOptions;
  css: CSSOptions;
  js: JSOptions;
  html: HTMLOptions;
};

/**
 * Default options for Breezify
 */
export const defaultOptions: BreezifyOptions = {
  files: {
    buildDir: "dist",
    pattern: "**/*.{css,js,html}",
    ignore: [],
  },
  css: {
    shuffle: false,
    minify: true,
    extractClassesFromHtml: true,
    restructure: false,
    forceMediaMerge: false,
  },
  js: {
    mode: "acorn",
    minify: true,
  },
  html: {
    attributes: ["class"],
    minify: true,
  },
};

/**
 * Default options for minifying HTML
 */
export const minifyHtmlDefaultOptions: Options = {
  minifyCSS: true,
  minifyJS: true,
  collapseWhitespace: true,
  useShortDoctype: true,
  sortClassName: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeRedundantAttributes: true,
  removeComments: true,
  caseSensitive: true,
  collapseBooleanAttributes: true,
};

/**
 * Merge the default options with the provided options
 * @param options {DeepPartial<BreezifyOptions>} - The options to merge with the default options
 * @returns The merged options
 */
export function withDefaultOptions(
  options: DeepPartial<BreezifyOptions> = {},
): BreezifyOptions {
  return merge(defaultOptions, options);
}

/**
 * Merge the provided options with the config options
 * @param config {BreezifyOptions} - The config options
 * @param options {DeepPartial<BreezifyOptions>} - The options to merge with the config options
 * @returns The merged options
 */
export function mergeConfigs(
  config: BreezifyOptions,
  options: DeepPartial<BreezifyOptions>,
): BreezifyOptions {
  return merge(config, options);
}

/**
 * Generate the content for the config file
 * @param useTypescript {boolean} - Whether to use TypeScript
 * @returns The content for the config file
 */
export function generateConfigFileContent() {
  // Get project type from package.json to determine whether to use export or module.exports
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  const useExport = packageJson.type === "module";
  const declarationPart = useExport ? "export default" : "module.exports =";
  const jsDocType = `/** @type {import('breezify').BreezifyOptions} */\n`;

  // Return file content
  return `${jsDocType}${declarationPart} ${JSON.stringify(defaultOptions, null, 2)}`;
}
