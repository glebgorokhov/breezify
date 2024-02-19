// Replace class names in JS content with care
import acorn, { AnyNode } from "acorn";
import walk from "acorn-walk";
import { escapeString } from "./helpers";
import { generate } from "astring";

export type SkipRule = (node: AnyNode, ancestors: AnyNode[]) => boolean;

export function replaceClassNamesInJs(
  content: string,
  ignoreJsStringPatterns: RegExp[],
  classMap: Record<string, string>,
  skipRules: SkipRule[] = [],
  mode: "acorn" | "simple" = "acorn",
): string {
  let newContent = "";

  // Unescape classMap's keys
  const unescapedClassMap: Record<string, string> = {};
  for (const [key, value] of Object.entries(classMap)) {
    unescapedClassMap[key.replace(/\\/g, "")] = value;
  }

  // Should the current node be skipped?
  function shouldSkip(node: AnyNode, ancestors: AnyNode[]): boolean {
    // Skip if the current node is part of an import declaration
    const isInImportDeclaration = ancestors.some(
      (ancestor) => ancestor.type === "ImportDeclaration",
    );
    if (isInImportDeclaration) return true;

    skipRules.forEach((rule) => {
      if (rule(node, ancestors)) return true;
    });

    return false;
  }

  // Function to update class names in string literals
  function updateClassNames(value: string) {
    if (
      !ignoreJsStringPatterns.length ||
      !ignoreJsStringPatterns.some((pattern) => pattern.test(value))
    ) {
      // Split the string by spaces, assuming it could contain multiple class names
      const classNames = value.split(/\s+/);

      // Map each class name through classMap for replacements
      return classNames
        .map((className) => {
          const hasDot = className.startsWith(".");
          const classNameWithoutDot = hasDot ? className.slice(1) : className;
          const newClassName =
            unescapedClassMap[classNameWithoutDot] || classNameWithoutDot;
          return hasDot ? `.${newClassName}` : newClassName;
        })
        .join(" ");
    }

    return value;
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
            node.value = updatedValue;
            node.raw = `'${escapeString(updatedValue)}'`;
          }
        }
      },
      Property(node) {
        if (node.key.type === "Literal" && typeof node.key.value === "string") {
          const updatedKey = updateClassNames(node.key.value);
          if (updatedKey !== node.key.value) {
            node.key.value = updatedKey;
            node.key.raw = `'${escapeString(updatedKey)}'`;
          }
        } else if (node.key.type === "Identifier") {
          const updatedName = updateClassNames(node.key.name);
          if (updatedName !== node.key.name) {
            // This part is tricky; identifiers don't have a `raw` property, so you'd need to replace them in a way that affects the output code.
            // It might involve more sophisticated AST-to-code transformations or ensuring your updates here can be reflected in the output.
            node.key.name = updatedName;
          }
        }
      },
      TemplateLiteral(node) {
        node.quasis.forEach((quasi) => {
          const updatedValue = updateClassNames(quasi.value.raw);
          if (updatedValue !== quasi.value.raw) {
            quasi.value.raw = updatedValue;
            quasi.value.cooked = updatedValue;
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

  return newContent;
}
