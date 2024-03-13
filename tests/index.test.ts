import { test, describe } from "vitest";
import * as fs from "fs";
import breezify from "../index.js";

describe("run breezify on test projects", () => {
  const folders = fs.readdirSync("tests/data/build-files").filter((folder) => {
    return fs.lstatSync(`tests/data/build-files/${folder}`).isDirectory();
  });

  if (!folders.length) {
    console.log("No test folders found in tests/data/build-files");
  }

  folders.forEach((folder) => {
    test(`breezify ${folder}`, async () => {
      const buildDir = `tests/data/build-files/${folder}`;
      const outputDir = `tests/data/output-files/${folder}`;
      const config = `tests/data/configs/${folder}.json`;
      const configFileExists = fs.existsSync(config);

      await breezify({
        config: configFileExists ? config : undefined,
        files: {
          buildDir,
          outputDir,
        },
      });
    });
  });
});
