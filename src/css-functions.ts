import cssTree from "css-tree";
import fs from "fs";
import CleanCSS from "clean-css";
import { generateObfuscatedNames } from "./class-name-generator";
import { generateClassMap } from "./class-map";
import { CSSOptions } from "./options";

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
    return (
      !includeClassPatterns.length ||
      includeClassPatterns.some((pattern) => pattern.test(className))
    );
  }

  function shouldIgnore(className: string) {
    return (
      !ignoreClassPatterns.length ||
      ignoreClassPatterns.some((pattern) => pattern.test(className))
    );
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
 * @param fileList {string[]} - Array of file paths
 * @param cssOptions {CSSOptions} - CSS options
 */
export function extractClassNamesFromFiles(
  fileList: string[],
  cssOptions: CSSOptions,
) {
  const classNames = new Set<string>();

  fileList.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const fileClassNames = extractClassNames(content, cssOptions);

    fileClassNames.forEach((className) => {
      classNames.add(className);
    });
  });

  return classNames;
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
  const { sourceMap, minify } = cssOptions;

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
  let newContent = cssTree.generate(ast, {
    sourceMap,
  });

  // Minify the CSS content
  if (minify) {
    const minify = new CleanCSS().minify(newContent);
    newContent = minify.styles;
  }

  return newContent;
}

/**
 * Extract class names from CSS files and generate a map of old class names to new class names
 * @param fileList {string[]} - Array of file paths
 * @param cssOptions {CSSOptions} - CSS options
 */
export function extractClassesAndGenerateMap(
  fileList: string[],
  cssOptions: CSSOptions,
) {
  const classList = extractClassNamesFromFiles(fileList, cssOptions);
  const generatedClasses = generateObfuscatedNames(classList, cssOptions);
  return generateClassMap(classList, generatedClasses);
}
