import fs from "fs";
import {
  extractClassNamesFromFiles,
  replaceClassNamesInCSS,
} from "./src/cssFunctions";
import { getFilesInDirectory } from "./src/fileFunctions";
import { generateObfuscatedNames } from "./src/classNameGenerator";
import { generateClassMap } from "./src/classMap";
import { replaceClassNamesInHtml } from "./src/htmlFunctions";
import { replaceClassNamesInJs } from "./src/jsFunctions";

const ignoreClassPatterns: RegExp[] = [
  /^fa-/,
  /^ProseMirror/,
  /^Toastify/,
  /^react-select/,
  /^react-datepicker/,
  /^nestable/,
];

const ignoreJsStringPatterns = [/^%s:/];

const cssFilePattern = /\.css$/;
const jsFilePattern = /\.js$/;
const htmlFilePattern = /\.html$/;

// Main function to start processing
export async function minifyClassNames(folderPath = "build") {
  const fileLists = getFilesInDirectory(folderPath, {
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
      (content: string) => replaceClassNamesInCSS(content, classMap),
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

minifyClassNames().catch(console.error);
