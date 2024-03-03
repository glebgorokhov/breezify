import { Command, Option } from "commander";
import inquirer from "inquirer";
import { breezify } from "./breezify.js";
import {
  BreezifyOptions,
  defaultOptions,
  generateConfigFileContent,
  JSOptions,
} from "./options.js";
import set from "lodash.set";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const program = new Command();

const booleanChoices = ["true", "false"];

const booleanParser = (val: string) => val === "true";

program.version("1.0.0").name("breezify");

program
  .command("do")
  .description("Minify class names in your build folder's files")
  .argument("<buildPath>", "path to your build folder")
  .option("-c, --config <config>", "path to the config file")
  .option("-ic, --ignoreConfig", "ignore the config file")
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
  .addOption(
    new Option("--css.sourceMap <sourceMap>", "generate source maps")
      .default(defaultOptions.css.sourceMap)
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .addOption(
    new Option("--css.shuffle <shuffle>", "shuffle class names")
      .default(defaultOptions.css.shuffle)
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .option("--css.prefix <prefix>", "prefix to add to class names")
  .addOption(
    new Option("--css.minify <minify>", "minify the output CSS")
      .default(defaultOptions.css.minify)
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .option(
    "--js.ignoreStringPatterns <ignoreStringPatterns...>",
    "RegExp patterns to ignore when replacing class names in strings in JS files",
  )
  .addOption(
    new Option("--js.mode <mode>", "mode to replace class names in JS files")
      .default(defaultOptions.js.mode)
      .choices(["acorn", "simple"] as JSOptions["mode"][] as string[]),
  )
  .addOption(
    new Option("--js.minify <minify>", "minify the output JS")
      .default(defaultOptions.js.minify)
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .option(
    "--html.attributes <attributes...>",
    "HTML attributes to replace class names in",
    ["class"],
  )
  .addOption(
    new Option("--html.beautify <beautify>", "beautify the output HTML")
      .default(defaultOptions.html.beautify)
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .addOption(
    new Option("--html.minify <minify>", "minify the output HTML")
      .default(defaultOptions.html.minify)
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .action(async (path: string, options) => {
    const allOptions: BreezifyOptions = defaultOptions;

    set(allOptions, "files.buildDir", path);

    Object.entries(options).forEach(([key, value]) => {
      set(allOptions, key, value);
    });

    await breezify(allOptions);
  });

program
  .command("init")
  .description("Create a new Breezify config file in your project folder")
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "path",
        message: "Where do you want to save the config file?",
        default: "/",
      },
    ]);

    const fullPath = path.join(
      process.cwd(),
      answers.path,
      `breezify.config.js`,
    );

    try {
      fs.writeFileSync(fullPath, generateConfigFileContent(false), "utf-8");

      console.log(
        chalk.green(`Successfully created breezify.config.js in ${fullPath}!`),
      );
    } catch (error) {
      console.error(
        chalk.red(`An error occurred while creating the config file: ${error}`),
      );
    }
  });

export default program;
