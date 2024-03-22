import { type Compiler } from "webpack";
import {
  BreezifyOptions,
  CSSOptions,
  defaultOptions,
  mergeConfigs,
} from "../../options";
import { extractClassNames, replaceClassNamesInCSS } from "../../css-functions";
import { generateObfuscatedNames } from "../../class-name-generator";
import { generateClassMap } from "../../class-map";
import {
  getStylesFromHtmlStyleTags,
  replaceClassNamesInHtml,
} from "../../html-functions";
import { replaceClassNamesInJs } from "../../js-functions";
import { loadConfigFromFile } from "../../file-functions";
import { DeepPartial } from "../../helpers";

function getFileListsFromCompilationAssets(assets: Record<string, any>) {
  return Object.keys(assets)
    .filter((file) => file.match(/\.(js|html|css)$/))
    .reduce(
      (acc, file) => {
        const extension = file.split(".").pop();
        if (extension) {
          acc[extension as keyof typeof acc].push(file);
        }
        return acc;
      },
      { js: [], html: [], css: [] } as {
        js: string[];
        html: string[];
        css: string[];
      },
    );
}

async function extractClassNamesFromAssets(
  fileList: string[],
  assets: Record<string, any>,
  cssOptions: CSSOptions,
) {
  const classNames = new Set<string>();

  for (const filePath of fileList) {
    let content = assets[filePath].source() as string;

    if (filePath.endsWith(".html") && cssOptions.extractClassesFromHtml) {
      content = await getStylesFromHtmlStyleTags(content, cssOptions);
    }

    const extractedClassNames = extractClassNames(content, cssOptions);
    extractedClassNames.forEach((className) => classNames.add(className));
  }

  return classNames;
}

export default class BreezifyWebpackPlugin {
  private options: BreezifyOptions;

  constructor(options: DeepPartial<BreezifyOptions> = {}) {
    this.options = mergeConfigs(defaultOptions, options);
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      "BreezifyWebpackPlugin",
      async (compilation) => {
        const loadedConfig = !this.options?.ignoreConfig
          ? await loadConfigFromFile(this.options?.config)
          : this.options;

        const { css, js, html } = loadedConfig;

        compilation.hooks.processAssets.tapAsync(
          {
            name: "BreezifyWebpackPlugin",
            // @ts-expect-error I know what I'm doing
            stage: compilation.constructor.PROCESS_ASSETS_STAGE_SUMMARIZE,
          },
          async (assets, callback) => {
            const fileLists = getFileListsFromCompilationAssets(assets);

            if (fileLists.css.length) {
              // Generate class map
              const classNames = await extractClassNamesFromAssets(
                [...fileLists.css, ...fileLists.html],
                assets,
                css,
              );
              const generatedClasses = generateObfuscatedNames(classNames, css);
              const classMap = generateClassMap(classNames, generatedClasses);

              // Replace functions
              const listsAndReplaceFunctions: [
                string[],
                (content: string) => string | Promise<string>,
              ][] = [
                [
                  fileLists.css,
                  (content: string) =>
                    replaceClassNamesInCSS(content, classMap, css),
                ],
                [
                  fileLists.html,
                  (content: string) =>
                    replaceClassNamesInHtml(content, classMap, html, js, css),
                ],
                [
                  fileLists.js,
                  (content: string) =>
                    replaceClassNamesInJs(content, classMap, js, css),
                ],
              ];

              // Update files
              for (const [
                fileList,
                replaceFunction,
              ] of listsAndReplaceFunctions) {
                for (const filePath of fileList) {
                  const content = assets[filePath].source() as string;
                  const updatedContent = await replaceFunction(content);
                  assets[filePath].source = () => updatedContent;
                  assets[filePath].size = () => updatedContent.length;
                  console.log(
                    `Updated file: ${filePath}; saved ${(content.length - updatedContent.length) / 1000} Kb (${((1 - updatedContent.length / content.length) * 100).toFixed(2)}%)`,
                  );
                }
              }
            }

            callback();
          },
        );
      },
    );
  }
}
