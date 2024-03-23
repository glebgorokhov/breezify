import * as cssTree from "css-tree";
import { minify } from "csso";
import fs from "fs";

import { generateClassMap } from "./class-map.js";
import { generateObfuscatedNames } from "./class-name-generator.js";
import { getStylesFromHtmlStyleTags } from "./html-functions.js";
import { CSSOptions } from "./options.js";

/**
 * Extract class names from CSS content
 * @param content {string} - CSS content
 * @param cssOptions {CSSOptions} - CSS options
 */
export function extractClassNames(content: string, cssOptions: CSSOptions) {
  const classNames = new Set<string>();
  const tree = cssTree.parse(content);

  const ignoreClassPatterns =
    cssOptions.ignoreClassPatterns?.map((className) => new RegExp(className)) ||
    [];

  const includeClassPatterns =
    cssOptions.includeClassPatterns?.map(
      (className) => new RegExp(className),
    ) || [];

  function shouldInclude(className: string) {
    return includeClassPatterns.length
      ? includeClassPatterns.some((pattern) => pattern.test(className))
      : true;
  }

  function shouldIgnore(className: string) {
    return ignoreClassPatterns.length
      ? ignoreClassPatterns.some((pattern) => pattern.test(className))
      : false;
  }

  cssTree.walk(tree, function (node) {
    if (node.type === "ClassSelector") {
      if (!shouldIgnore(node.name) && shouldInclude(node.name)) {
        classNames.add(node.name); // Add the class name to the Set
      }
    }
  });

  return classNames;
}

/**
 * Extract class names from a list of CSS files
 * @param options {object} - Options
 * @param options.fileList {string[]} - Array of file paths
 * @param options.cssOptions {CSSOptions} - CSS options
 */
export async function extractClassNamesFromFiles(options: {
  fileList: string[];
  cssOptions: CSSOptions;
}) {
  const { fileList, cssOptions } = options;
  const classNames = new Set<string>();

  for (const filePath of fileList) {
    let content = fs.readFileSync(filePath, "utf8");

    if (filePath.endsWith(".html") && cssOptions.extractClassesFromHtml) {
      content = await getStylesFromHtmlStyleTags(content, cssOptions);
    }

    const fileClassNames = extractClassNames(content, cssOptions);

    fileClassNames.forEach((className) => {
      classNames.add(className);
    });
  }

  return classNames;
}

/**
 * Check if a string is a valid CSS selector
 * @param value {string} - String to check
 */
export function isSelectorString(value: string) {
  try {
    const ast = cssTree.parse(value);
    return !!cssTree.find(ast, (node) => node.type === "ClassSelector");
  } catch (e) {
    return false;
  }
}

/**
 * Replace class names in CSS content with new class names
 * @param content {string} - CSS content
 * @param classMap {Record<string, string>} - Map of old class names to new class names
 * @param cssOptions {CSSOptions} - CSS options
 */
export function replaceClassNamesInCSS(
  content: string,
  classMap: Record<string, string>,
  cssOptions: CSSOptions,
): string {
  // Parse the CSS content into an AST
  const ast = cssTree.parse(content);

  // Walk through the AST to find class selectors
  cssTree.walk(ast, {
    visit: "ClassSelector",
    enter: function (node: { name: string }) {
      // If the current class name is in the classMap, replace it with the new class name
      if (classMap[node.name]) {
        node.name = classMap[node.name];
      }
    },
  });

  // Generate the modified CSS content from the AST and return it
  let newContent: string = cssTree.generate(ast, {
    sourceMap: false,
  });

  // Minify the CSS content
  if (cssOptions.minify) {
    newContent = minify(newContent, {
      restructure: cssOptions.restructure,
      forceMediaMerge: cssOptions.forceMediaMerge,
      comments: false,
    }).css;
  }

  return newContent;
}

/**
 * Extract class names from CSS files and generate a map of old class names to new class names
 * @param options {object}
 * @param options.fileList {string[]} - Array of file paths
 * @param options.cssOptions {CSSOptions} - CSS options
 */
export async function extractClassesAndGenerateMap(options: {
  fileList: string[];
  cssOptions: CSSOptions;
}) {
  const { fileList, cssOptions } = options;
  const classList = await extractClassNamesFromFiles({
    fileList,
    cssOptions,
  });

  if (classList.size === 0) {
    throw new Error("No class names found in the CSS files.");
  }

  const generatedClasses = generateObfuscatedNames(classList, cssOptions);
  return generateClassMap(classList, generatedClasses);
}
