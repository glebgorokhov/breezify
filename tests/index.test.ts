import {
  extractClassesAndGenerateMap,
  extractClassNamesFromFiles,
  replaceClassNamesInCSS,
} from "../src/css-functions";
import { expectedClassNames } from "./data/expected-classes";
import { generateObfuscatedNames } from "../src/class-name-generator";
import { generateClassMap } from "../src/class-map";
import { replaceClassNamesInHtml } from "../src/html-functions";
import { replaceClassNamesInJs } from "../src/js-functions";
import { skipEventListeners, skipLocalStorageMethods } from "../src/skip-rules";
import { updateFileAndCompareSize } from "../src/file-functions";
import { test, expect, describe } from "vitest";

describe("generate and replace CSS class names", () => {
  let classList: Set<string>;
  let generatedClasses: string[];
  let classMap: Record<string, string>;

  test("extract classes from original CSS file", () => {
    classList = extractClassNamesFromFiles(
      ["tests/data/style.css"],
      [/interactive/],
    );
    expect(Array.from(classList)).toEqual(expectedClassNames);
  });

  test("replace classes in CSS file", () => {
    generatedClasses = generateObfuscatedNames(classList);
    classMap = generateClassMap(classList, generatedClasses);

    updateFileAndCompareSize({
      path: "tests/data/style.css",
      targetPath: "tests/data/style.min.css",
      updateContent: (content) =>
        replaceClassNamesInCSS(content, classMap, false),
    });
  });

  test("replace classes in HTML file", () => {
    updateFileAndCompareSize({
      path: "tests/data/index.html",
      targetPath: "tests/data/index.min.html",
      updateContent: (content) =>
        replaceClassNamesInHtml(content, classMap, ["class"], false, true),
    });
  });

  test("replace classes in JS file", () => {
    updateFileAndCompareSize({
      path: "tests/data/index.js",
      targetPath: "tests/data/index.min.js",
      updateContent: (content) =>
        replaceClassNamesInJs(content, [], classMap, [
          skipEventListeners,
          skipLocalStorageMethods,
        ]),
    });
  });

  test("example for readme", () => {
    const exampleClassList = extractClassNamesFromFiles(
      ["tests/data/example.css"],
      [],
    );

    const exampleGeneratedClasses = generateObfuscatedNames(exampleClassList);
    const exampleClassMap = generateClassMap(
      exampleClassList,
      exampleGeneratedClasses,
    );

    updateFileAndCompareSize({
      path: "tests/data/example.css",
      targetPath: "tests/data/example.min.css",
      updateContent: (content) =>
        replaceClassNamesInCSS(content, exampleClassMap, false),
    });

    updateFileAndCompareSize({
      path: "tests/data/example.html",
      targetPath: "tests/data/example.min.html",
      updateContent: (content) =>
        replaceClassNamesInHtml(
          content,
          exampleClassMap,
          ["class"],
          true,
          false,
        ),
    });
  });

  test("tailwind homepage", () => {
    const exampleClassMap = extractClassesAndGenerateMap(
      ["tests/data/tailwind-homepage.css"],
      [/^dark$/],
    );

    updateFileAndCompareSize({
      path: "tests/data/tailwind-homepage.css",
      targetPath: "tests/data/tailwind-homepage.min.css",
      updateContent: (content) =>
        replaceClassNamesInCSS(content, exampleClassMap, false),
    });

    updateFileAndCompareSize({
      path: "tests/data/tailwind-homepage.html",
      targetPath: "tests/data/tailwind-homepage.min.html",
      updateContent: (content) =>
        replaceClassNamesInHtml(
          content,
          exampleClassMap,
          ["class"],
          false,
          true,
        ),
    });
  });
});
