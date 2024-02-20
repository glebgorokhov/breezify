// Get a list of all files in the directory and subdirectories
import fs, { Dirent } from "fs";
import path from "path";

export function getFilesInDirectory(
  directory: string,
  patterns: { js: RegExp; css: RegExp; html: RegExp },
) {
  const cssFileList: string[] = [];
  const jsFileList: string[] = [];
  const htmlFileList: string[] = [];

  function getFilePaths(directory: string) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(
      (entry: Dirent) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          getFilePaths(entryPath); // Recursive call for nested directories
        } else {
          const patternListPairs: [RegExp, string[]][] = [
            [patterns.css, cssFileList],
            [patterns.js, jsFileList],
            [patterns.html, htmlFileList],
          ];

          patternListPairs.forEach(([pattern, fileList]) => {
            if (pattern.test(entry.name)) {
              fileList.push(entryPath);
            }
          });
        }
      },
    );
  }

  getFilePaths(directory);

  return {
    css: cssFileList,
    js: jsFileList,
    html: htmlFileList,
  };
}

export function getFileSizeInKb(filePath: string) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

export function updateFileAndCompareSize({
  path,
  targetPath = path,
  updateContent,
}: {
  path: string;
  targetPath: string;
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
    `${path} => ${targetPath}; ${originalSize}kb => ${updatedSize}kb; ${savedSize.toFixed(2)}kb saved (${savedPercentage}%)`,
  );
}
