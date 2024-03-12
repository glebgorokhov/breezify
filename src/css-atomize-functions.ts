import * as cssTree from "css-tree";
import { generateObfuscatedNames } from "./class-name-generator.js";
import CleanCSS from "clean-css";
import { CSSOptions } from "./options.js";

export function collectPropertyPairs(content: string) {
  const propertyPairs = new Set<string>();
  const tree = cssTree.parse(content);

  cssTree.walk(tree, function (node) {
    if (node.type === "Declaration") {
      const stringValue = cssTree.generate(node.value);
      const pair = `${node.property}|||${stringValue}`;
      propertyPairs.add(pair);
    }
  });

  return propertyPairs;
}

export function generateAtomizedCssMap(
  propertyPairs: Set<string>,
  cssOptions: CSSOptions,
) {
  const propertyPairsArray = Array.from(propertyPairs);
  const classNames: string[] = generateObfuscatedNames(
    propertyPairs,
    cssOptions,
  );
  return Object.fromEntries(
    classNames.map((className, i) => [propertyPairsArray[i], className]),
  );
}

export function mapOldClassNamesToNew(
  content: string,
  atomizedMap: Record<string, string>,
) {
  const map: Record<string, Set<string>> = {};

  // Walk through the tree, split each class into array of propertyPair strings, found each pair in atomizedMap keys, and add the value to the set
  const tree = cssTree.parse(content);
  let currentClassName = "";

  cssTree.walk(tree, function (node) {
    if (node.type === "ClassSelector") {
      currentClassName = node.name;
    }

    if (node.type === "Declaration") {
      const stringValue = cssTree.generate(node.value);
      const pair = `${node.property}|||${stringValue}`;
      const newClassName = atomizedMap[pair];

      if (newClassName) {
        if (!map[currentClassName]) {
          map[currentClassName] = new Set();
        }
        map[currentClassName].add(newClassName);
      }
    }
  });

  console.log(map);

  return map;
}

export function generateAtomizedCSS(
  propertyPairs: Set<string>,
  cssOptions: CSSOptions,
) {
  const propertyPairsArray = Array.from(propertyPairs);
  const classMap = generateAtomizedCssMap(propertyPairs, cssOptions);
  let css = "";

  for (let i = 0; i < propertyPairs.size; i++) {
    const pair = propertyPairsArray[i];
    const [property, value] = pair.split("|||");
    css += `.${classMap[pair]} { ${property}: ${value} }\n`;
  }

  const minifyResult = new CleanCSS({
    sourceMap: false,
  }).minify(css);

  css = minifyResult.styles;

  return css;
}
