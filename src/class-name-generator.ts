import { CSSOptions } from "./options.js";

// All possible characters for first symbol of class name
const safeClassNameSymbols =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// All possible characters for other symbols of class name
const allClassNameSymbols = safeClassNameSymbols + "0123456789_-";

/**
 * Generate obfuscated class names
 * @param classNames {Set<string>} - Set of class names
 * @param cssOptions {CSSOptions} - CSS options
 */
export function generateObfuscatedNames(
  classNames: Set<string>,
  cssOptions: CSSOptions,
) {
  const obfuscatedClassNames: string[] = [];
  const count = classNames.size;
  let name, temp;

  function withPrefix(name: string) {
    return cssOptions.prefix ? `${cssOptions.prefix}${name}` : name;
  }

  function shuffledClassNames(classNames: string[]) {
    if (!cssOptions.shuffle) {
      return classNames;
    }

    const copy = classNames.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  for (let i = 0; i < count; i++) {
    name = "";
    temp = i;

    name += safeClassNameSymbols[temp % safeClassNameSymbols.length];
    temp = Math.floor(temp / safeClassNameSymbols.length);

    while (temp > 0) {
      temp--;
      name += allClassNameSymbols[temp % allClassNameSymbols.length];
      temp = Math.floor(temp / allClassNameSymbols.length);
    }

    obfuscatedClassNames.push(withPrefix(name));
  }

  return shuffledClassNames(obfuscatedClassNames);
}
