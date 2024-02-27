import {
  getFilesInDirectory,
  updateFileAndCompareSize,
} from "./file-functions";
import {
  extractClassesAndGenerateMap,
  replaceClassNamesInCSS,
} from "./css-functions";
import { replaceClassNamesInHtml } from "./html-functions";
import { replaceClassNamesInJs } from "./js-functions";
import { BreezifyOptions, withDefaultOptions } from "./options";
import { DeepPartial } from "./helpers";

/**
 * Minify class names in CSS, JS, and HTML files.
 * @param options {BreezifyOptions} - Options to configure the minification process.
 */
export async function breezify(options: DeepPartial<BreezifyOptions> = {}) {
  const { files, css, js, html } = withDefaultOptions(options);

  const fileLists = getFilesInDirectory(files);
  const classMap = extractClassesAndGenerateMap(fileLists.css, css);

  const listsAndReplaceFunctions: [string[], (content: string) => string][] = [
    [
      fileLists.css,
      (content: string) => replaceClassNamesInCSS(content, classMap, css),
    ],
    [
      fileLists.html,
      (content: string) => replaceClassNamesInHtml(content, classMap, html),
    ],
    [
      fileLists.js,
      (content: string) => replaceClassNamesInJs(content, classMap, js),
    ],
  ];

  listsAndReplaceFunctions.forEach(([fileList, replaceFunction]) => {
    fileList.forEach((filePath) => {
      updateFileAndCompareSize({
        path: filePath,
        targetPath: filePath,
        updateContent: replaceFunction,
      });
    });
  });

  console.log("Class names have been obfuscated and replaced successfully.");
}
