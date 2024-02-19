import {
  extractClassNamesFromFiles,
  replaceClassNamesInCSS,
} from "../src/css-functions";
import * as fs from "fs";
import { expectedClassNames } from "./data/expected-classes";
import { generateObfuscatedNames } from "../src/class-name-generator";
import { generateClassMap } from "../src/class-map";
import { describe } from "node:test";
import { replaceClassNamesInHtml } from "../src/html-functions";
import { replaceClassNamesInJs } from "../src/js-functions";
import { skipEventListeners, skipLocalStorageMethods } from "../src/skip-rules";

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
    const content = fs.readFileSync("tests/data/style.css", "utf-8");
    const replacedCss = replaceClassNamesInCSS(content, classMap, false);

    // For now, just write the replaced CSS to a file for manual inspection
    // fs.writeFileSync("tests/data/style.min.css", replacedCss, "utf-8");

    const expectedCss = fs.readFileSync("tests/data/style.min.css", "utf-8");
    expect(replacedCss).toEqual(expectedCss);
  });

  test("replace classes in HTML file", () => {
    const content = fs.readFileSync("tests/data/index.html", "utf-8");
    const replacedHtml = replaceClassNamesInHtml(content, classMap);

    // For now, just write the replaced HTML to a file for manual inspection
    // fs.writeFileSync("tests/data/index.min.html", replacedHtml, "utf-8");

    const expectedHtml = fs.readFileSync("tests/data/index.min.html", "utf-8");
    expect(replacedHtml).toEqual(expectedHtml);
  });

  test("replace classes in JS file", () => {
    const content = fs.readFileSync("tests/data/index.js", "utf-8");
    const replacedJs = replaceClassNamesInJs(content, [], classMap, [
      skipEventListeners,
      skipLocalStorageMethods,
    ]);

    // For now, just write the replaced JS to a file for manual inspection
    // fs.writeFileSync("tests/data/index.min.js", replacedJs, "utf-8");

    const expectedJs = fs.readFileSync("tests/data/index.min.js", "utf-8");
    expect(replacedJs).toEqual(expectedJs);
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
    const exampleContent = fs.readFileSync("tests/data/example.css", "utf-8");
    const exampleReplacedCss = replaceClassNamesInCSS(
      exampleContent,
      exampleClassMap,
      false,
    );
    const exampleHtml = fs.readFileSync("tests/data/example.html", "utf-8");
    const exampleReplacedHtml = replaceClassNamesInHtml(
      exampleHtml,
      exampleClassMap,
      ["class"],
      true,
      false,
    );

    fs.writeFileSync("tests/data/example.min.css", exampleReplacedCss, "utf-8");
    fs.writeFileSync(
      "tests/data/example.min.html",
      exampleReplacedHtml,
      "utf-8",
    );
  });
});
