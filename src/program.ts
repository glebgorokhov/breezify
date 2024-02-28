import { Command, Option } from "commander";
import inquirer from "inquirer";
// import { breezify } from "./breezify.js";
import { BreezifyOptions, defaultOptions, JSOptions } from "./options.js";
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

    console.log(allOptions);

    // await breezify({
    //   buildDir: path,
    //   ...options,
    // });
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
      "breezify.config.json",
    );

    fs.writeFileSync(
      fullPath,
      JSON.stringify(defaultOptions, null, 2),
      "utf-8",
    );

    console.log(
      chalk.green(`Successfully created breezify.config.json in ${fullPath}!`),
    );
  });

export default program;
