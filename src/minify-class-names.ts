import { getFilesInDirectory } from "./file-functions";
import {
  extractClassNamesFromFiles,
  replaceClassNamesInCSS,
} from "./css-functions";
import { generateObfuscatedNames } from "./class-name-generator";
import { generateClassMap } from "./class-map";
import { replaceClassNamesInHtml } from "./html-functions";
import { replaceClassNamesInJs } from "./js-functions";
import fs from "fs";

export interface MinifyClassNamesOptions {
  buildDir?: string;
  cssFilePattern?: RegExp;
  jsFilePattern?: RegExp;
  htmlFilePattern?: RegExp;
  ignoreJsStringPatterns?: RegExp[];
  ignoreClassPatterns?: RegExp[];
  generateCssSourceMap?: boolean;
}

// Main function to start processing
export async function minifyClassNames(options?: MinifyClassNamesOptions) {
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
    ignoreJsStringPatterns: [/^%s:/],
    ignoreClassPatterns: [
      /^fa-/,
      /^ProseMirror/,
      /^Toastify/,
      /^react-select/,
      /^react-datepicker/,
      /^nestable/,
    ],
    generateCssSourceMap: true,
    ...options,
  };

  const fileLists = getFilesInDirectory(buildDir, {
    js: jsFilePattern,
    css: cssFilePattern,
    html: htmlFilePattern,
  });

  const classNames = extractClassNamesFromFiles(
    fileLists.css,
    ignoreClassPatterns,
  );
  const obfuscatedClassNames: string[] = generateObfuscatedNames(classNames);
  const classMap = generateClassMap(classNames, obfuscatedClassNames);

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
      const content = fs.readFileSync(filePath, "utf8");
      fs.writeFileSync(filePath, replaceFunction(content), "utf8");
    });
  });

  console.log("Class names have been obfuscated and replaced successfully.");
}
