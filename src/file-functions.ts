// Get a list of all files in the directory and subdirectories
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { globSync } from "glob";
import { FilesOptions } from "./options.js";

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
    throw new Error(`The directory "${buildDir}" does not exist.`);
  }

  if (outputDir) {
    if (outputDir === buildDir) {
      throw new Error(
        `You have specified the same directory for both "buildDir" and "outputDir".`,
      );
    }

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
    cwd: cwd,
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
    const filePath = path.join(buildDir, file);
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
export function updateFileAndCompareSize({
  path,
  targetPath = path,
  updateContent,
}: {
  path: string;
  targetPath?: string;
  updateContent: (content: string) => string;
}) {
  const content = fs.readFileSync(path, "utf8");
  const originalSize = getFileSizeInKb(path);

  const updatedContent = updateContent(content);
  fs.writeFileSync(targetPath, updatedContent, "utf8");
  const updatedSize = getFileSizeInKb(targetPath);

  const savedSize = parseFloat(originalSize) - parseFloat(updatedSize);
  const savedPercentage = (
    (savedSize / parseFloat(originalSize)) *
    100
  ).toFixed(2);

  console.log(
    chalk.yellow("Write: ") +
      `${Array.from(new Set([path, targetPath])).join("=>")}; ${originalSize}kb => ${updatedSize}kb; ${savedSize.toFixed(2)}kb saved (${chalk.green(savedPercentage + "%")})`,
  );
}
