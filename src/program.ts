import { Command, Option } from "commander";
import inquirer from "inquirer";
import { breezify } from "./breezify.js";
import {
  BreezifyOptions,
  generateConfigFileContent,
  JSOptions,
} from "./options.js";
import set from "lodash.set";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { DeepPartial } from "./helpers.js";

const program = new Command();

const booleanChoices = ["true", "false"];

const booleanParser = (val: string) => val === "true";

program.version("1.0.4").name("breezify");

program
  .command("do")
  .description("Minify class names in your build folder's files")
  .addOption(
    new Option("-b, --files.buildDir <buildDir>", "path to build directory"),
  )
  .option("-c, --config <config>", "path to the config file")
  .option("-ic, --ignoreConfig", "ignore the config file")
  .option("-o, --files.outputDir <outputDir>", "output directory")
  .option("-p, --files.pattern <pattern>", "pattern to match the files")
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
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .addOption(
    new Option("--css.shuffle <shuffle>", "shuffle class names")
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .option("--css.prefix <prefix>", "prefix to add to class names")
  .addOption(
    new Option("--css.minify <minify>", "minify the output CSS")
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .addOption(
    new Option(
      "--css.extractClassesFromHtml <extractClassesFromHtml>",
      "whether to extract class names from style tags found in HTML files",
    )
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .option(
    "--js.ignoreStringPatterns <ignoreStringPatterns...>",
    "RegExp patterns to ignore when replacing class names in strings in JS files",
  )
  .addOption(
    new Option(
      "--js.mode <mode>",
      "mode to replace class names in JS files",
    ).choices(["acorn", "simple"] as JSOptions["mode"][] as string[]),
  )
  .addOption(
    new Option("--js.minify <minify>", "minify the output JS")
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
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .addOption(
    new Option("--html.minify <minify>", "minify the output HTML")
      .choices(booleanChoices)
      .argParser(booleanParser),
  )
  .action(async (options) => {
    const allOptions: DeepPartial<BreezifyOptions> = {};

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
      fs.writeFileSync(fullPath, generateConfigFileContent(), "utf-8");

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
