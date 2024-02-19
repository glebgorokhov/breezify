import cssTree from "css-tree";
import fs from "fs";
import CleanCSS from "clean-css";

// Extract class names from CSS content
export function extractClassNames(
  cssContent: string,
  ignoreClassPatterns: RegExp[],
) {
  const classNames = new Set<string>();
  const tree = cssTree.parse(cssContent);

  cssTree.walk(tree, function (node) {
    if (node.type === "ClassSelector") {
      if (!ignoreClassPatterns.some((pattern) => pattern.test(node.name))) {
        classNames.add(node.name); // Add the class name to the Set
      }
    }
  });

  return classNames;
}

export function extractClassNamesFromFiles(
  fileList: string[],
  ignoreClassPatterns: RegExp[],
) {
  const classNames = new Set<string>();

  fileList.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const fileClassNames = extractClassNames(content, ignoreClassPatterns);

    fileClassNames.forEach((className) => {
      classNames.add(className);
    });
  });

  return classNames;
}

// Replace class names in content based on a map
export function replaceClassNamesInCSS(
  content: string,
  classMap: Record<string, string>,
  generateCssSourceMap: boolean,
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
  const minify = new CleanCSS().minify(
    cssTree.generate(ast, {
      sourceMap: generateCssSourceMap,
    }),
  );

  console.log(
    `Saved ${minify.stats.efficiency * 100}% of CSS file size. Original: ${minify.stats.originalSize / 1024} KB, Minified: ${minify.stats.minifiedSize / 1024} KB.`,
  );

  return minify.styles;
}
