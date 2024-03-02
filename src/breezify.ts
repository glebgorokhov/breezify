import {
  getFilesInDirectory,
  loadConfigFromFile,
  updateFileAndCompareSize,
} from "./file-functions.js";
import {
  extractClassesAndGenerateMap,
  replaceClassNamesInCSS,
} from "./css-functions.js";
import { replaceClassNamesInHtml } from "./html-functions.js";
import { replaceClassNamesInJs } from "./js-functions.js";
import { BreezifyOptions, defaultOptions, mergeConfigs } from "./options.js";
import { DeepPartial } from "./helpers.js";

/**
 * Minify class names in CSS, JS, and HTML files.
 * @param options {BreezifyOptions} - Options to configure the minification process.
 */
export async function breezify(options: DeepPartial<BreezifyOptions> = {}) {
  const loadedConfig = !options.ignoreConfig
    ? await loadConfigFromFile(options.config)
    : defaultOptions;

  const { files, css, js, html } = mergeConfigs(loadedConfig, options);

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
