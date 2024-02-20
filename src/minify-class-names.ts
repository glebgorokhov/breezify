import {
  getFilesInDirectory,
  updateFileAndCompareSize,
} from "./file-functions";
import {
  extractClassesAndGenerateMap,
  extractClassNamesFromFiles,
  replaceClassNamesInCSS,
} from "./css-functions";
import { generateObfuscatedNames } from "./class-name-generator";
import { generateClassMap } from "./class-map";
import { replaceClassNamesInHtml } from "./html-functions";
import { replaceClassNamesInJs } from "./js-functions";
import { BreezifyOptions } from "./options";

// Main function to start processing
export async function minifyClassNames(options?: BreezifyOptions) {
  const {
    buildDir,
    cssFilePattern,
    jsFilePattern,
    htmlFilePattern,
    ignoreJsStringPatterns,
    ignoreClassPatterns,
    generateCssSourceMap,
  } = {
    buildDir: "./dist",
    cssFilePattern: /\.css$/,
    jsFilePattern: /\.js$/,
    htmlFilePattern: /\.html$/,
    ignoreJsStringPatterns: [],
    ignoreClassPatterns: [],
    generateCssSourceMap: true,
    ...options,
  };

  const fileLists = getFilesInDirectory(buildDir, {
    js: jsFilePattern,
    css: cssFilePattern,
    html: htmlFilePattern,
  });

  const classMap = extractClassesAndGenerateMap(
    fileLists.css,
    ignoreClassPatterns,
  );

  const listsAndReplaceFunctions: [string[], (content: string) => string][] = [
    [
      fileLists.css,
      (content: string) =>
        replaceClassNamesInCSS(content, classMap, generateCssSourceMap),
    ],
    [
      fileLists.html,
      (content: string) => replaceClassNamesInHtml(content, classMap),
    ],
    [
      fileLists.js,
      (content: string) =>
        replaceClassNamesInJs(content, ignoreJsStringPatterns, classMap),
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
