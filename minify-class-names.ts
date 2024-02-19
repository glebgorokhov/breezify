import { Command } from "commander";
import {
  minifyClassNames,
  MinifyClassNamesOptions,
} from "./src/minify-class-names";

const program = new Command();

program
  .name("minify-class-names")
  .description("CLI to class minifier package")
  .version("1.0.0");

program
  .command("minify")
  .description("Minify class names in your build files")
  .argument("<buildPath>", "path to your build folder")
  .action((path: string, options: MinifyClassNamesOptions) => {
    minifyClassNames({
      buildDir: path,
      ...options,
    });
  });

program.parse();