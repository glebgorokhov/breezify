import { SkipRule } from "./js-functions";
import { Options } from "html-minifier";
import merge from "lodash.merge";
import { DeepPartial } from "./helpers";

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
   * Whether to generate source maps
   * @default true
   */
  sourceMap: boolean;
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
    sourceMap: true,
    shuffle: true,
    minify: true,
  },
  js: {
    mode: "acorn",
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

export function withDefaultOptions(
  options: DeepPartial<BreezifyOptions> = {},
): BreezifyOptions {
  return merge(defaultOptions, options);
}
