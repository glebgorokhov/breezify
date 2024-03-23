import { expect, test } from "vitest";

import { generateObfuscatedNames } from "../src/class-name-generator";
import { defaultOptions } from "../src/options";

test("generates 10000 unique classes", () => {
  const classNames = generateObfuscatedNames(
    new Set(Array.from({ length: 10000 }).map((_, i) => `class-${i}`)),
    defaultOptions.css,
  );
  expect(classNames.length).toBe(10000);
  expect(new Set(classNames).size).toBe(10000);
});

test("class names don't start with a number", () => {
  const classNames = generateObfuscatedNames(
    new Set(Array.from({ length: 10000 }).map((_, i) => `class-${i}`)),
    defaultOptions.css,
  );
  expect(classNames.every((name) => !/^\d/.test(name))).toBe(true);
});
