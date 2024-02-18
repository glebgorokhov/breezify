import { AnyNode, Expression } from "acorn";

export function skipEventListeners(
  node: AnyNode,
  ancestors: AnyNode[],
): boolean {
  const parentNode = ancestors[ancestors.length - 2];

  if (parentNode) {
    if (
      parentNode.type === "CallExpression" &&
      ["addEventListener", "removeEventListener"].includes(
        // @ts-expect-error TS can't identify the type properly
        (parentNode as Expression).callee?.property?.name,
      )
    ) {
      return true;
    }
  }

  return false;
}

export function skipLocalStorageMethods(
  node: AnyNode,
  ancestors: AnyNode[],
): boolean {
  const parentNode = ancestors[ancestors.length - 2];

  if (parentNode) {
    if (
      parentNode.type === "MemberExpression" &&
      parentNode.object.type === "Identifier" &&
      parentNode.object.name === "localStorage"
    ) {
      return true;
    }
  }

  return false;
}
