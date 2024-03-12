import { describe, test } from "vitest";
import { getFilesInDirectory } from "../src/file-functions.js";
import { defaultOptions, withDefaultOptions } from "../src/options.js";
import {
  collectPropertyPairs,
  generateAtomizedCSS,
  generateAtomizedCssMap,
  mapOldClassNamesToNew,
} from "../src/css-atomize-functions.js";
import { extractCssContentFromFiles } from "../src/css-functions.js";
import fs from "fs";

describe("atomize-css", () => {
  test("should work", async () => {
    const config = withDefaultOptions({
      files: {
        buildDir: "tests/data/build-files/tailwind-complete",
        outputDir: "tests/data/output-files/tailwind-complete",
      },
    });

    const files = getFilesInDirectory(config.files);

    const cssContent = await extractCssContentFromFiles(
      [...files.css, ...files.html],
      defaultOptions.css,
    );

    const propertyPairs = collectPropertyPairs(cssContent);

    const atomizedMap = generateAtomizedCssMap(
      propertyPairs,
      defaultOptions.css,
    );

    const atomizedCss = generateAtomizedCSS(propertyPairs, defaultOptions.css);

    const mapClassNames = mapOldClassNamesToNew(cssContent, atomizedMap);

    // Write file to outputDir/atomized.css
    fs.writeFileSync(
      `${config.files.outputDir}/atomized.css`,
      atomizedCss,
      "utf8",
    );
  });
});
