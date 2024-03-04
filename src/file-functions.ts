// Get a list of all files in the directory and subdirectories
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { globSync } from "glob";
import { BreezifyOptions, defaultOptions, FilesOptions } from "./options.js";
import { register } from "ts-node";

export function getRelativePath(filePath: string) {
  return path.relative(process.cwd(), filePath);
}

/**
 * Get a list of all files in the directory and subdirectories
 * @param filesOptions {FilesOptions} - Options to configure the files to include or exclude
 */
export function getFilesInDirectory(filesOptions: FilesOptions) {
  const { pattern, buildDir, outputDir, ignore } = filesOptions;

  // Check if directory exists
  if (!fs.existsSync(buildDir)) {
    throw new Error(
      `The directory "${buildDir}" does not exist. Did you forget to build your project?`,
    );
  }

  if (outputDir && outputDir !== buildDir) {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
      console.log(
        chalk.yellow("Removed output directory: ") + getRelativePath(outputDir),
      );
    }

    copyDirectory(buildDir, outputDir);
  }

  // Set the current working directory
  const cwd = outputDir || buildDir;

  const fileList = globSync(pattern, {
    cwd,
  });

  const listsByType: {
    css: string[];
    js: string[];
    html: string[];
  } = {
    css: [],
    js: [],
    html: [],
  };

  // Add the files to the lists by type
  fileList.forEach((file) => {
    const filePath = path.join(cwd, file);
    const ext = path.extname(filePath).slice(1);

    if (
      ignore.length &&
      ignore.some((pattern) => new RegExp(pattern).test(filePath))
    ) {
      return;
    }

    if (ext in listsByType) {
      listsByType[ext as keyof typeof listsByType].push(filePath);
    }
  });

  return listsByType;
}

/**
 * Copy a directory and its contents to a target directory
 * @param source {string} - Source directory
 * @param target {string} - Target directory
 */
export function copyDirectory(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
    console.log(
      chalk.yellow("Created output directory: ") + getRelativePath(target),
    );
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const filePath = path.join(source, file);
    const targetPath = path.join(target, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyDirectory(filePath, targetPath);
    } else {
      fs.copyFileSync(filePath, targetPath);
    }
  });
}

/**
 * Get the file size in kilobytes
 * @param filePath {string} - Path to the file
 */
export function getFileSizeInKb(filePath: string) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Update a file's content and compare the size difference
 * @param path {string} - Path to the file
 * @param targetPath {string} - Path to the target file
 * @param updateContent {(content: string) => string} - Function to update the content
 */
export async function updateFileAndCompareSize({
  path,
  targetPath = path,
  updateContent,
}: {
  path: string;
  targetPath?: string;
  updateContent: (content: string) => string | Promise<string>;
}): Promise<string> {
  const content = fs.readFileSync(path, "utf8");
  const originalSize = getFileSizeInKb(path);

  const updatedContent = await updateContent(content);
  fs.writeFileSync(targetPath, updatedContent, "utf8");
  const updatedSize = getFileSizeInKb(targetPath);

  const savedSize = parseFloat(originalSize) - parseFloat(updatedSize);
  const savedPercentage = (
    (savedSize / parseFloat(originalSize)) *
    100
  ).toFixed(2);

  return (
    chalk.yellow("Write: ") +
    `${Array.from(new Set([path, targetPath])).join("=>")}; ${originalSize}kb => ${updatedSize}kb; ${savedSize.toFixed(2)}kb saved (${chalk[savedSize > 0 ? "green" : "red"](savedPercentage + "%")})`
  );
}

/**
 * Load the Breezify config from a file
 * @param configPath {string} - Path to the Breezify config file
 */
export async function loadConfigFromFile(configPath?: string) {
  register();

  // If no configPath provided then we try to find the config file in the current working directory ("breezify.config.js" or "breezify.config.ts")
  if (!configPath) {
    const jsConfigPath = path.join(process.cwd(), "breezify.config.js");

    if (fs.existsSync(jsConfigPath)) {
      configPath = jsConfigPath;
    } else {
      console.log(
        `No config file found in the current working directory. Proceeding with default options.`,
      );

      return defaultOptions;
    }
  }

  // If a configPath is provided then we check if it exists
  if (!fs.existsSync(configPath)) {
    throw new Error(`The config file "${configPath}" does not exist.`);
  }

  console.log("Config file was found! Loading...");

  try {
    const config = await import(configPath);
    console.log("Config file was loaded successfully.");
    return config.default as BreezifyOptions;
  } catch (error) {
    console.log("Error loading config file. Proceeding with default options.");
    return defaultOptions;
  }
}
