import { minify } from "html-minifier";
import { parse, serialize } from "parse5";
import pretty from "pretty";

import { replaceClassNamesInCSS } from "./css-functions.js";
import { replaceClassNamesInJs } from "./js-functions.js";
import {
  CSSOptions,
  HTMLOptions,
  JSOptions,
  minifyHtmlDefaultOptions,
} from "./options.js";

type Node = {
  tagName?: string;
  nodeName: string;
  attrs?: { name: string; value: string }[];
  value?: string;
  childNodes?: Node[];
};

/**
 * Replace class names in HTML content with new class names
 * @param content {string} - HTML content
 * @param classMap {Record<string, string>} - Map of old class names to new class names
 * @param htmlOptions {HTMLOptions} - HTML options
 * @param jsOptions {JSOptions} - JS options
 * @param cssOptions {CSSOptions} - CSS options
 */
export async function replaceClassNamesInHtml(
  content: string,
  classMap: Record<string, string>,
  htmlOptions: HTMLOptions,
  jsOptions: JSOptions,
  cssOptions: CSSOptions,
): Promise<string> {
  const { attributes = ["class"], beautify, minify: minifyHtml } = htmlOptions;

  // Unescape classMap's keys
  const unescapedClassMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(classMap)) {
    unescapedClassMap[key.replace(/\\/g, "")] = value;
  }

  // Parse the HTML content into an AST
  const document = parse(content);

  // Recursive function to walk through all nodes in the AST
  async function traverseNode(node: Node) {
    if (jsOptions.minifyInlineJS) {
      // Replaces class names in text nodes
      if (node.tagName === "script" && node.childNodes?.length) {
        for (const child of node.childNodes) {
          if (child.nodeName === "#text" && child.value) {
            child.value = await replaceClassNamesInJs(
              child.value,
              classMap,
              jsOptions,
              cssOptions,
            );
          }
        }
      }
    }

    // Update inline CSS
    if (node.tagName === "style" && node.childNodes?.length) {
      for (const child of node.childNodes) {
        if (child.nodeName === "#text" && child.value) {
          child.value = replaceClassNamesInCSS(
            child.value,
            classMap,
            cssOptions,
          );
        }
      }
    }

    // Replaces class names in attributes
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
      for (const child of node.childNodes) {
        await traverseNode(child);
      }
    }
  }

  // Start traversing from the root
  await traverseNode(document as Node);

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

/**
 * Get inline styles from HTML content
 * @param content {string} - HTML content
 * @param cssOptions {CSSOptions} - CSS options
 */
export async function getStylesFromHtmlStyleTags(
  content: string,
  cssOptions: CSSOptions,
): Promise<string> {
  // Parse the HTML content into an AST
  const document = parse(content);

  let styles = "";

  // Recursive function to walk through all nodes in the AST
  async function traverseNode(node: Node) {
    // Update inline CSS
    if (node.tagName === "style" && node.childNodes?.length) {
      for (const child of node.childNodes) {
        if (child.nodeName === "#text" && child.value) {
          styles += replaceClassNamesInCSS(child.value, {}, cssOptions);
        }
      }
    }

    if (node.childNodes) {
      for (const child of node.childNodes) {
        await traverseNode(child);
      }
    }
  }

  // Start traversing from the root
  await traverseNode(document as Node);

  return styles;
}
