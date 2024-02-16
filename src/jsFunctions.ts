// Replace class names in JS content with care
import acorn from "acorn";
import walk from "acorn-walk";
import { escapeString } from "./helpers";
import { generate } from "astring";

export function replaceClassNamesInJs(
  content: string,
  ignoreJsStringPatterns: RegExp[],
  classMap: Record<string, string>,
): string {
  const ast = acorn.parse(content, { ecmaVersion: 2020, sourceType: "module" }); // Parse JS content into AST

  function updateClassNames(value: string) {
    if (
      !ignoreJsStringPatterns.length ||
      !ignoreJsStringPatterns.some((pattern) => pattern.test(value))
    ) {
      // Split the string by spaces, assuming it could contain multiple class names
      const classNames = value.split(/\s+/);

      // Map each class name through classMap for replacements
      return classNames
        .map((className) => classMap[className] || className)
        .join(" ");
    }

    return value;
  }

  walk.simple(ast, {
    Literal(node) {
      // Check if the literal is a string
      if (typeof node.value === "string") {
        const updatedValue = updateClassNames(node.value);
        if (updatedValue !== node.value) {
          node.value = updatedValue;
          node.raw = `'${escapeString(updatedValue)}'`;
        }
      }
    },
  });

  return generate(ast); // Generate JS code from the modified AST
}
