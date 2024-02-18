import {
  extractClassNamesFromFiles,
  replaceClassNamesInCSS,
} from "../src/cssFunctions";
import * as fs from "fs";
import { expectedClassNames } from "./data/expected-classes";
import { generateObfuscatedNames } from "../src/classNameGenerator";
import { generateClassMap } from "../src/classMap";
import { describe } from "node:test";
import { replaceClassNamesInHtml } from "../src/htmlFunctions";
import { replaceClassNamesInJs } from "../src/jsFunctions";
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
    fs.writeFileSync("tests/data/index.min.js", replacedJs, "utf-8");

    const expectedJs = fs.readFileSync("tests/data/index.min.js", "utf-8");
    expect(replacedJs).toEqual(expectedJs);
  });
});
