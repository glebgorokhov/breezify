import { generateObfuscatedNames } from "../src/classNameGenerator";

test("generates 10000 unique classes", () => {
  const classNames = generateObfuscatedNames(
    new Set(Array.from({ length: 10000 }).map((_, i) => `class-${i}`)),
  );
  expect(classNames.length).toBe(10000);
  expect(new Set(classNames).size).toBe(10000);
});
