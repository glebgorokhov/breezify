import { AnyNode, Expression } from "acorn";

/**
 * Skip event listeners
 * @param node {AnyNode} - AST node
 * @param ancestors {AnyNode[]} - Ancestors of the AST node
 */
export function skipEventListeners(
  node: AnyNode,
  ancestors: AnyNode[],
): boolean {
  const parentNode = ancestors[ancestors.length - 2];

  return ["addEventListener", "removeEventListener"].includes(
    // @ts-expect-error TS can't identify the type properly
    (parentNode as Expression)?.callee?.property?.name,
  );
}

/**
 * Skip local storage methods
 * @param node {AnyNode} - AST node
 * @param ancestors {AnyNode[]} - Ancestors of the AST node
 */
export function skipLocalStorageMethods(
  node: AnyNode,
  ancestors: AnyNode[],
): boolean {
  return (
    // @ts-expect-error TS can't identify the type properly
    ancestors[ancestors.length - 2]?.callee?.object?.name === "localStorage"
  );
}
