const safeClassNameSymbols =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const allClassNameSymbols = safeClassNameSymbols + "0123456789_-";

// Utility function to generate obfuscated class names
export function generateObfuscatedNames(classNames: Set<string>) {
  const obfuscatedClassNames: string[] = [];
  const count = classNames.size;
  let name, temp;

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

    obfuscatedClassNames.push(name.split("").reverse().join(""));
  }

  return obfuscatedClassNames;
}
