import { Command } from "commander";
import { breezify } from "./breezify";
import { BreezifyOptions, defaultOptions } from "./options";
import set from "lodash.set";

const program = new Command();

program
  .name("breezify")
  .description("Minify class names in your build folder's files")
  .version("1.0.0")
  .argument("<buildPath>", "path to your build folder")
  .option("-o, --files.outputDir <outputDir>", "output directory", "dist")
  .option(
    "-p, --files.pattern <pattern>",
    "pattern to match the files",
    "**/*.{css,js,html}",
  )
  .option("-i, --files.ignore <ignore...>", "RegExp patterns to ignore")
  .option(
    "--css.includeClassPatterns <includeClassPatterns...>",
    "RegExp patterns to include",
  )
  .option(
    "--css.ignoreClassPatterns <ignoreClassPatterns...>",
    "RegExp patterns to ignore",
  )
  .option("--css.sourceMap <sourceMap>", "generate source maps", true)
  .option("--css.shuffle <shuffle>", "shuffle class names", true)
  .option("--css.prefix <prefix>", "prefix to add to class names")
  .option("--css.minify <minify>", "minify the output CSS", true)
  .option(
    "--js.ignoreStringPatterns <ignoreStringPatterns...>",
    "RegExp patterns to ignore when replacing class names in strings in JS files",
  )
  .option(
    "--js.skipRules <skipRules...>",
    "RegExp patterns to ignore when replacing class names in JS files",
  )
  .option(
    "--js.mode <mode>",
    "mode to replace class names in JS files",
    "acorn",
  )
  .option(
    "--html.attributes <attributes...>",
    "HTML attributes to replace class names in",
    ["class"],
  )
  .option("--html.beautify <beautify>", "beautify the output HTML", false)
  .option("--html.minify <minify>", "minify the output HTML", true)
  .action(async (path: string, options) => {
    const allOptions: BreezifyOptions = defaultOptions;

    console.log(options);

    set(options, "files.buildDir", path);

    // await breezify({
    //   buildDir: path,
    //   ...options,
    // });
  });

export default program;
