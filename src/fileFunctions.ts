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
