import { serialize, parse } from "parse5";
import { minify } from "html-minifier";
import pretty from "pretty";
import { HTMLOptions, minifyHtmlDefaultOptions } from "./options";

type Node = {
  attrs?: { name: string; value: string }[];
  childNodes?: Node[];
};

/**
 * Replace class names in HTML content with new class names
 * @param content {string} - HTML content
 * @param classMap {Record<string, string>} - Map of old class names to new class names
 * @param htmlOptions {HTMLOptions} - HTML options
 */
export function replaceClassNamesInHtml(
  content: string,
  classMap: Record<string, string>,
  htmlOptions: HTMLOptions,
): string {
  const { attributes = ["class"], beautify, minify: minifyHtml } = htmlOptions;

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
        if (attributes.includes(attr.name)) {
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

  // Beautify the HTML content
  if (beautify) {
    newContent = pretty(newContent, {
      ocd: beautify === true ? true : beautify.ocd,
    });
  }

  // Minify the HTML content
  if (minifyHtml) {
    newContent = minify(
      newContent,
      minifyHtml === true ? minifyHtmlDefaultOptions : minifyHtml,
    );
  }

  return newContent;
}
