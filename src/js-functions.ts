// Replace class names in JS content with care
import * as acorn from "acorn";
import { AnyNode } from "acorn";
import * as walk from "acorn-walk";
import { escapeString } from "./helpers.js";
import { generate } from "astring";
import chalk from "chalk";
import { CSSOptions, JSOptions } from "./options.js";
import { minify } from "terser";
import { isSelectorString, replaceClassNamesInCSS } from "./css-functions.js";

export type SkipRule = (node: AnyNode, ancestors: AnyNode[]) => boolean;

export async function replaceClassNamesInJs(
  content: string,
  classMap: Record<string, string>,
  jsOptions: JSOptions,
  cssOptions: CSSOptions,
): Promise<string> {
  const {
    ignoreStringPatterns = [],
    skipRules = [],
    mode = "acorn",
  } = jsOptions;

  const ignoreRegExpPatterns = ignoreStringPatterns.map(
    (pattern) => new RegExp(pattern, "m"),
  );

  let newContent = "";

  // Unescape classMap's keys
  const unescapedClassMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(classMap)) {
    unescapedClassMap[key.replace(/\\/g, "")] = value;
  }

  // Array of class names
  const classNamesArray = Object.keys(unescapedClassMap);

  // Should the current node be skipped?
  function shouldSkip(node: AnyNode, ancestors: AnyNode[]): boolean {
    // Skip if the current node is part of an import declaration
    const isInImportDeclaration = ancestors.some(
      (ancestor) => ancestor.type === "ImportDeclaration",
    );
    if (isInImportDeclaration) return true;

    return (
      !!skipRules.length && skipRules.some((rule) => rule(node, ancestors))
    );
  }

  // Function to update class names in string literals
  function updateClassNames(value: string) {
    if (
      value.trim() !== "" &&
      (!ignoreRegExpPatterns.length
        ? true
        : !ignoreRegExpPatterns.some((pattern) => pattern.test(value)))
    ) {
      // Split the string by spaces, assuming it could contain multiple class names
      const classNames = value.split(/\s+/);

      if (
        !classNamesArray.some((className) => classNames.includes(className))
      ) {
        return value;
      }

      const isSelector = isSelectorString(value + " * { display: block; }");

      if (isSelector) {
        const newVal = replaceClassNamesInCSS(
          value + " * { display: block; }",
          classMap,
          {
            ...cssOptions,
            minify: false,
          },
        );

        return newVal.replace(/\s?\*\s?{\s?display:\s?block\s?}\s*$/gm, "");
      }

      // Map each class name through classMap for replacements
      return classNames
        .map((className) => {
          return unescapedClassMap[className] || className;
        })
        .join(" ");
    }

    return value;
  }

  function getFunctionDeclarationFromAncestors(
    ancestors: AnyNode[],
    updates: string[],
    changeStartEnd: [number, number],
  ) {
    return;

    const ancestor = ancestors.reverse().slice(0, 3).reverse()[0];

    let functionCode = content.slice(ancestor.start, ancestor.end);
    const relativeStartEnd = [
      changeStartEnd[0] - ancestor.start,
      changeStartEnd[1] - ancestor.start,
    ];
    const functionCodeAsArray = functionCode.split("");
    functionCodeAsArray.splice(
      relativeStartEnd[0],
      relativeStartEnd[1] - relativeStartEnd[0],
      chalk.bold(chalk.cyan(updates[0])),
    );
    functionCode = functionCodeAsArray.join("");

    console.log(
      `${chalk.yellow("Replace:")} ${updates.map((x, n) => chalk[n ? "green" : "red"](`"${x}"`)).join(" => ")} in function:

${functionCode}
`,
    );
  }

  if (mode === "acorn") {
    const ast = acorn.parse(content, {
      ecmaVersion: 2020,
      sourceType: "module",
    }); // Parse JS content into AST

    walk.ancestor(ast, {
      Literal(node, ancestors) {
        if (shouldSkip(node, ancestors as AnyNode[])) return;

        // Check if the literal is a string
        if (typeof node.value === "string") {
          const updatedValue = updateClassNames(node.value);
          if (updatedValue !== node.value) {
            getFunctionDeclarationFromAncestors(
              ancestors as AnyNode[],
              [node.value, updatedValue],
              [node.start, node.end],
            );
            node.value = updatedValue;
            node.raw = `'${escapeString(updatedValue)}'`;
          }
        }
      },
      Property(node, ancestors) {
        if (shouldSkip(node, ancestors as AnyNode[])) return;

        if (node.key.type === "Literal" && typeof node.key.value === "string") {
          const updatedKey = updateClassNames(node.key.value);
          if (updatedKey !== node.key.value) {
            getFunctionDeclarationFromAncestors(
              ancestors as AnyNode[],
              [node.key.value, updatedKey],
              [node.key.start, node.key.end],
            );
            node.key.value = updatedKey;
            node.key.raw = `'${escapeString(updatedKey)}'`;
          }
        } /* else if (node.key.type === "Identifier") {
          const updatedName = updateClassNames(node.key.name);
          if (updatedName !== node.key.name) {
            // This part is tricky; identifiers don't have a `raw` property, so you'd need to replace them in a way that affects the output code.
            // It might involve more sophisticated AST-to-code transformations or ensuring your updates here can be reflected in the output.
            node.key.name = updatedName;
          }
        } */
      },
      TemplateLiteral(node, ancestors) {
        if (shouldSkip(node, ancestors as AnyNode[])) return;

        let rawContent = content.slice(node.start, node.end);

        node.expressions.forEach((expression, index) => {
          // replace string part from expression.start to expression.end with string ".stringExpressionToIgnore"
          rawContent = rawContent.replace(
            content.slice(expression.start - 2, expression.end + 1),
            "#stringExpressionToIgnore" + index,
          );
        });

        rawContent = rawContent.replace(/^`|`$/g, "");

        const updatedValue = updateClassNames(rawContent);

        // Split updated value by #stringExpressionToIgnore\d+ and update each node.quasis with the new value
        const updatedValueParts = updatedValue.split(
          /#stringExpressionToIgnore\d+/,
        );

        node.quasis.forEach((quasi, index) => {
          const updatedValuePart = updatedValueParts[index];

          if (updatedValuePart !== quasi.value.raw) {
            getFunctionDeclarationFromAncestors(
              ancestors as AnyNode[],
              [quasi.value.raw, updatedValuePart],
              [quasi.start, quasi.end],
            );
            quasi.value.raw = updatedValuePart;
            quasi.value.cooked = updatedValuePart;
          }
        });
      },
    });

    newContent = generate(ast); // Generate JS code from the modified AST
  } else {
    // Simple mode
    newContent = content;
    for (const [key, value] of Object.entries(unescapedClassMap)) {
      const regex = new RegExp(`\\b${key}\\b`, "gm");
      newContent = newContent.replace(regex, value);
    }
  }

  if (jsOptions.minify) {
    newContent = (
      await minify(newContent, {
        compress: true,
        mangle: false,
      })
    ).code as string;
  }

  return newContent;
}
