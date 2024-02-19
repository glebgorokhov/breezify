// Function that generates a map of original class names to obfuscated class names
export function generateClassMap(
  classNames: Set<string>,
  obfuscatedClassNames: string[],
) {
  const classMap: Record<string, string> = {};

  Array.from(classNames).forEach((className, index) => {
    classMap[className] = obfuscatedClassNames[index];
  });

  return classMap;
}
