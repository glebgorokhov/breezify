/**
 * Generate obfuscated class names
 * @param classNames {Set<string>} - Set of class names
 * @param obfuscatedClassNames {string[]} - Array of obfuscated class names
 */
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
