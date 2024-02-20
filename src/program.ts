import { Command } from "commander";
import { minifyClassNames } from "./minify-class-names";
import { BreezifyOptions } from "./options";

const program = new Command();

program
  .name("minify-class-names")
  .description("CLI to class minifier package")
  .version("1.0.0");

program
  .command("minify")
  .description("Minifies class names in your build folder's files")
  .argument("<buildPath>", "path to your build folder")
  .action(async (path: string, options: BreezifyOptions) => {
    await minifyClassNames({
      buildDir: path,
      ...options,
    });
  });

export default program;
