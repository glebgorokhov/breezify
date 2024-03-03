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
import { defaultOptions } from "../src/options";

describe("generate and replace CSS class names", () => {
  let classList: Set<string>;
  let generatedClasses: string[];
  let classMap: Record<string, string>;

  test("extract classes from original CSS file", () => {
    classList = extractClassNamesFromFiles(["tests/data/style.css"], {
      ...defaultOptions.css,
      ignoreClassPatterns: ["interactive"],
    });
    expect(Array.from(classList)).toEqual(expectedClassNames);
  });

  test("replace classes in CSS file", () => {
    generatedClasses = generateObfuscatedNames(classList, defaultOptions.css);
    classMap = generateClassMap(classList, generatedClasses);

    updateFileAndCompareSize({
      path: "tests/data/style.css",
      targetPath: "tests/data/style.min.css",
      updateContent: (content) =>
        replaceClassNamesInCSS(content, classMap, defaultOptions.css),
    });
  });

  test("replace classes in HTML file", () => {
    updateFileAndCompareSize({
      path: "tests/data/index.html",
      targetPath: "tests/data/index.min.html",
      updateContent: (content) =>
        replaceClassNamesInHtml(
          content,
          classMap,
          defaultOptions.html,
          defaultOptions.js,
        ),
    });
  });

  test("replace classes in JS file", () => {
    updateFileAndCompareSize({
      path: "tests/data/index.js",
      targetPath: "tests/data/index.min.js",
      updateContent: (content) =>
        replaceClassNamesInJs(content, classMap, {
          ...defaultOptions.js,
          skipRules: [skipEventListeners, skipLocalStorageMethods],
        }),
    });
  });

  test("example for readme", () => {
    const exampleClassList = extractClassNamesFromFiles(
      ["tests/data/example.css"],
      defaultOptions.css,
    );

    const exampleGeneratedClasses = generateObfuscatedNames(
      exampleClassList,
      defaultOptions.css,
    );
    const exampleClassMap = generateClassMap(
      exampleClassList,
      exampleGeneratedClasses,
    );

    updateFileAndCompareSize({
      path: "tests/data/example.css",
      targetPath: "tests/data/example.min.css",
      updateContent: (content) =>
        replaceClassNamesInCSS(content, exampleClassMap, defaultOptions.css),
    });

    updateFileAndCompareSize({
      path: "tests/data/example.html",
      targetPath: "tests/data/example.min.html",
      updateContent: (content) =>
        replaceClassNamesInHtml(
          content,
          exampleClassMap,
          defaultOptions.html,
          defaultOptions.js,
        ),
    });
  });

  test("tailwind homepage", () => {
    const cssOptions = {
      ...defaultOptions.css,
      ignoreClassPatterns: ["^dark$"],
    };

    const exampleClassMap = extractClassesAndGenerateMap(
      ["tests/data/tailwind-homepage.css"],
      cssOptions,
    );

    updateFileAndCompareSize({
      path: "tests/data/tailwind-homepage.css",
      targetPath: "tests/data/tailwind-homepage.min.css",
      updateContent: (content) =>
        replaceClassNamesInCSS(content, exampleClassMap, cssOptions),
    });

    updateFileAndCompareSize({
      path: "tests/data/tailwind-homepage.html",
      targetPath: "tests/data/tailwind-homepage.min.html",
      updateContent: (content) =>
        replaceClassNamesInHtml(
          content,
          exampleClassMap,
          defaultOptions.html,
          defaultOptions.js,
        ),
    });
  });
});
