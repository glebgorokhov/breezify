import {Dirent} from "fs";

const fs = require("fs")
const path = require("path")
const cssTree = require("css-tree")
const acorn = require("acorn")
const walk = require("acorn-walk")
const { generate } = require("astring")

const ignoreClassPatterns = [
  /^fa-/,
  /^ProseMirror/,
  /^Toastify/,
  /^react-select/,
  /^react-datepicker/,
  /^nestable/,
]

const ignoreJsStringPatterns = [/^%s:/]

const cssFilePattern = /\.css$/
const jsFilePattern = /\.js$/
const htmlFilePattern = /\.html$/

const cssFileList: string[] = []
const jsFileList: string[] = []
const htmlFileList: string[] = []

const classNames = new Set<string>()
const obfuscatedClassNames: string[] = []
const classMap: Record<string, string> = {}

// Get a list of all files in the directory and subdirectories
function getFilesInDirectory(directory: string) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry: Dirent) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      getFilesInDirectory(entryPath) // Recursive call for nested directories
    } else {
      const patternListPairs: [RegExp, string[]][] = [
        [cssFilePattern, cssFileList],
        [jsFilePattern, jsFileList],
        [htmlFilePattern, htmlFileList],
      ]

      patternListPairs.forEach(([pattern, fileList]) => {
        if (pattern.test(entry.name)) {
          fileList.push(entryPath)
        }
      })
    }
  })
}

// Extract class names from CSS content
function extractClassNames(cssContent: string) {
  const tree = cssTree.parse(cssContent)

  cssTree.walk(tree, function (node: { type: string; name: string }) {
    if (node.type === "ClassSelector") {
      if (!ignoreClassPatterns.some((pattern) => pattern.test(node.name))) {
        classNames.add(node.name) // Add the class name to the Set
      }
    }
  })
}

// Extract class names from CSS files
function extractClassNamesFromFiles() {
  cssFileList.forEach((filePath) => {
    const content = fs.readFileSync(filePath, "utf8")
    extractClassNames(content)
  })
}

const safeClassNameSymbols =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

const allClassNameSymbols =
  safeClassNameSymbols + "0123456789_-"

// Utility function to generate obfuscated class names
function generateObfuscatedNames() {
  const count = classNames.size
  let name, temp;

  for (let i = 0; i < count; i++) {
    name = '';
    temp = i;

    name += safeClassNameSymbols[temp % safeClassNameSymbols.length];
    temp = Math.floor(temp / safeClassNameSymbols.length);

    while (temp > 0) {
      temp--;
      name += allClassNameSymbols[temp % allClassNameSymbols.length];
      temp = Math.floor(temp / allClassNameSymbols.length);
    }

    obfuscatedClassNames.push(name.split('').reverse().join(''));
  }
}

// Function that generates a map of original class names to obfuscated class names
function generateClassMap() {
  Array.from(classNames).forEach((className, index) => {
    classMap[className] = obfuscatedClassNames[index]
  })
}

// Replace class names in content based on a map
function replaceClassNamesInCSS(content: string): string {
  // Parse the CSS content into an AST
  const ast = cssTree.parse(content)

  // Walk through the AST to find class selectors
  cssTree.walk(ast, {
    visit: "ClassSelector",
    enter: function (node: { name: string }) {
      // If the current class name is in the classMap, replace it with the new class name
      if (classMap[node.name]) {
        node.name = classMap[node.name]
      }
    },
  })

  // Generate the modified CSS content from the AST and return it
  return cssTree.generate(ast)
}

// Replace class names in HTML content with care
function replaceClassNamesInHtml(content: string): string {
  return content.replace(/class=["']([^"']*)["']/g, (match, classNames) => {
    return `class="${classNames
    .split(/\s+/)
    .map((className: string) => classMap[className] || className)
    .join(" ")}"`
  })
}

function updateClassNames(value: string) {
  if (!ignoreJsStringPatterns.some((pattern) => pattern.test(value))) {
    // Split the string by spaces, assuming it could contain multiple class names
    const classNames = value.split(/\s+/)

    // Map each class name through classMap for replacements
    return classNames
    .map((className) => classMap[className] || className)
    .join(" ")
  }

  return value
}

// Helper function to escape special characters in strings
function escapeString(str: string) {
  return str
  .replace(/\\/g, "\\\\") // Escape backslashes
  .replace(/'/g, "\\'") // Escape single quotes
  .replace(/"/g, '\\"') // Escape double quotes
  .replace(/\n/g, "\\n") // Escape newlines
  .replace(/\r/g, "\\r") // Escape carriage returns
  .replace(/\t/g, "\\t") // Escape tabs
}

// Replace class names in JS content with care
function replaceClassNamesInJs(content: string): string {
  const ast = acorn.parse(content, { ecmaVersion: 2020, sourceType: "module" }) // Parse JS content into AST

  walk.simple(ast, {
    Literal(node: { value: unknown; raw: string }) {
      // Check if the literal is a string
      if (typeof node.value === "string") {
        const updatedValue = updateClassNames(node.value)
        if (updatedValue !== node.value) {
          node.value = updatedValue
          node.raw = `'${escapeString(updatedValue)}'`
        }
      }
    },
  })

  return generate(ast) // Generate JS code from the modified AST
}

// Main function to start processing
export async function minifyClassNames(folderPath = "build") {
  getFilesInDirectory(folderPath)
  extractClassNamesFromFiles()
  generateObfuscatedNames()
  generateClassMap()

  const listsAndReplaceFunctions: [string[], (content: string) => string][] = [
    [cssFileList, replaceClassNamesInCSS],
    [htmlFileList, replaceClassNamesInHtml],
    [jsFileList, replaceClassNamesInJs],
  ]

  listsAndReplaceFunctions.forEach(([fileList, replaceFunction]) => {
    fileList.forEach((filePath) => {
      const content = fs.readFileSync(filePath, "utf8")
      fs.writeFileSync(filePath, replaceFunction(content), "utf8")
    })
  })

  console.log("Class names have been obfuscated and replaced successfully.")
}

minifyClassNames().catch(console.error)
