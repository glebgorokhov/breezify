import {
  FileUpdateResult,
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
import chalk from "chalk";

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
  const classMap = await extractClassesAndGenerateMap({
    fileList: [...fileLists.css, ...fileLists.html],
    cssOptions: css,
  });

  const listsAndReplaceFunctions: [
    string[],
    (content: string) => string | Promise<string>,
  ][] = [
    [
      fileLists.css,
      (content: string) => replaceClassNamesInCSS(content, classMap, css),
    ],
    [
      fileLists.html,
      (content: string) =>
        replaceClassNamesInHtml(content, classMap, html, js, css),
    ],
    [
      fileLists.js,
      (content: string) => replaceClassNamesInJs(content, classMap, js, css),
    ],
  ];

  const writeResults: FileUpdateResult[] = [];

  for (const [fileList, replaceFunction] of listsAndReplaceFunctions) {
    for (const filePath of fileList) {
      writeResults.push(
        await updateFileAndCompareSize({
          path: filePath,
          targetPath: filePath,
          updateContent: replaceFunction,
        }),
      );
    }
  }

  const resultsByExtension = writeResults.reduce(
    (acc, result) => {
      if (!acc[result.fileExtension]) {
        acc[result.fileExtension] = [];
      }
      acc[result.fileExtension].push(result);
      return acc;
    },
    {} as Record<string, FileUpdateResult[]>,
  );

  for (const writeResult of writeResults) {
    console.log(writeResult.message);
  }

  const totalResultsByExtension = Object.entries(resultsByExtension).map(
    ([extension, results]) => {
      const totalOriginalSize = results.reduce(
        (acc, result) => acc + result.originalSize,
        0,
      );
      const totalUpdatedSize = results.reduce(
        (acc, result) => acc + result.updatedSize,
        0,
      );
      const totalSavedSize = results.reduce(
        (acc, result) => acc + result.savedSize,
        0,
      );
      const totalSavedPercentage = totalSavedSize / totalOriginalSize;
      return {
        extension,
        totalOriginalSize,
        totalUpdatedSize,
        totalSavedSize,
        totalSavedPercentage,
      };
    },
  );

  console.log("");
  console.log(chalk.bold("Savings:"));
  console.log("-----------------");

  for (const totalResult of totalResultsByExtension) {
    console.log(
      `${chalk.bold(totalResult.extension.toUpperCase())}: ${totalResult.totalSavedSize.toFixed(2)}KB (${(
        totalResult.totalSavedPercentage * 100
      ).toFixed(2)}%)`,
    );
  }

  const overallResult = totalResultsByExtension.reduce(
    (acc, result) => {
      acc.totalOriginalSize += result.totalOriginalSize;
      acc.totalUpdatedSize += result.totalUpdatedSize;
      acc.totalSavedSize += result.totalSavedSize;
      return acc;
    },
    {
      totalOriginalSize: 0,
      totalUpdatedSize: 0,
      totalSavedSize: 0,
    },
  );

  console.log("-----------------");

  console.log(
    chalk.bold("Overall") +
      ": " +
      chalk.bold(chalk.green(`${overallResult.totalSavedSize.toFixed(2)}KB`)) +
      " (" +
      chalk.bold(
        chalk.green(
          `${(
            (overallResult.totalSavedSize / overallResult.totalOriginalSize) *
            100
          ).toFixed(2)}%`,
        ),
      ) +
      ")",
  );

  console.log("");
  console.log("Class names have been obfuscated and replaced successfully.");
}
