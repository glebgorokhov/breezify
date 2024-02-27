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
import { BreezifyOptions, defaultOptions } from "./options";
import merge from "lodash.merge";

/**
 * Minify class names in CSS, JS, and HTML files.
 * @param options {BreezifyOptions} - Options to configure the minification process.
 */
export async function breezify(options: Partial<BreezifyOptions> = {}) {
  const { files, css, js, html } = merge(defaultOptions, options);

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
