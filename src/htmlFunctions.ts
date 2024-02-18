import { serialize, parse } from "parse5";
import { minify, Options } from "html-minifier";
import pretty from "pretty";

type Node = {
  attrs?: { name: string; value: string }[];
  childNodes?: Node[];
};

// Replace class names in HTML content with care
export function replaceClassNamesInHtml(
  content: string,
  classMap: Record<string, string>,
  attributeNames: string[] = ["class"],
  beautify:
    | boolean
    | {
        ocd: boolean;
      } = false,
  minifyHtml: boolean | Options = true,
): string {
  // Unescape classMap's keys
  const unescapedClassMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(classMap)) {
    unescapedClassMap[key.replace(/\\/g, "")] = value;
  }

  // Parse the HTML content into an AST
  const document = parse(content);

  // Recursive function to walk through all nodes in the AST
  function traverseNode(node: Node) {
    if (node.attrs) {
      node.attrs.forEach((attr) => {
        if (attributeNames.includes(attr.name)) {
          // Split the class attribute to handle multiple classes
          const classes = attr.value.split(" ");
          const replacedClasses = classes.map(
            (className) => unescapedClassMap[className] || className,
          );
          // Join the classes back and update the attribute value
          attr.value = replacedClasses.join(" ");
        }
      });
    }

    if (node.childNodes) {
      node.childNodes.forEach((childNode) => traverseNode(childNode));
    }
  }

  // Start traversing from the root
  traverseNode(document as Node);

  // Serialize the AST back to HTML
  let newContent = serialize(document, {
    scriptingEnabled: true,
  });

  if (beautify) {
    newContent = pretty(newContent, {
      ocd: beautify === true ? true : beautify.ocd,
    });
  }

  if (minifyHtml) {
    newContent = minify(
      newContent,
      minifyHtml === true
        ? {
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
          }
        : minifyHtml,
    );
  }

  return newContent;
}
