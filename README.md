<img src="./logo_light.svg#gh-light-mode-only" alt="logo" width="200" />
<img src="./logo_dark.svg#gh-dark-mode-only" alt="logo" width="200" />

# Breezify

![NPM Version](https://img.shields.io/npm/v/breezify?logo=npm)
![NPM Downloads](https://img.shields.io/npm/dw/breezify?logo=npm)
![GitHub License](https://img.shields.io/github/license/glebgorokhov/breezify)
![GitHub Issues](https://img.shields.io/github/issues/glebgorokhov/breezify?logo=github)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/glebgorokhov/breezify?logo=github)
![GitHub Sponsors](https://img.shields.io/github/sponsors/glebgorokhov)

Give some fresh air to your production HTML, JS and CSS! Breezify is a library that replaces class names in your build files with shorter ones.

Works with most frameworks. _Next.js is not supported yet._

- [Installation](#installation)
- [Usage](#usage)
  - [CLI usage](#cli-usage)
  - [API usage](#api-usage)
- [Examples](#examples)
- [Ask Question / Discuss](#ask-question-or-discuss)
- [Donations](#donations-)
- [Abstract](#abstract)
- [Reasons](#reasons)
- [Debugging](#debugging)
- [API Documentation](#breezify-options-api-documentation)
- [License](#license)
- [Contributing](#contributing)

## Sponsored by

[![Foxie Solutions](https://avatars.githubusercontent.com/u/128540116?s=60&v=4)](https://github.com/foxie-solutions)

If you like the project and want to support it, you can donate to the author:

- [GitHub Sponsors](https://github.com/sponsors/glebgorokhov)
- [BuyMeACoffee](https://www.buymeacoffee.com/glebgorokhov)

## Installation

1. `npm i -g breezify`
2. `breezify init` in your project folder to create a config file

## Usage

### CLI usage

- Update your build command in package.json like that: `{ "build": "your-build-command && breezify do" }`
- Use `breezify do -h` for the list of options

### API usage

```js
const breezify = require('breezify');

breezify(options);
```

## Examples

- Work in progress...

## Ask Question or Discuss

- [Create an issue](https://github.com/glebgorokhov/breezify/issues/new)
- [Join the Telegram group](https://t.me/breezifychat)

## Abstract

Long class names are great for development, but they can make your production files unnecessarily large. Replacing class names with shorter ones can reduce the file sizes and improve performance.

Breezify turns this:

```html
<div class="w-full max-w-content px-6 md:px-9 grid mx-auto z-[1] relative gap-x-6 md:gap-x-10 gap-y-6 md:gap-y-10 grid-cols-1 md:grid-cols-2 justify-items-start items-start">
  <a
    href="#"
    class="gap-2 items-center mb-10 transition-all text-theme-text-interactive dark:text-dark-text-interactive group-hover:text-theme-text-interactive-hover hover:text-theme-text-interactive-hover dark:hover:text-dark-text-interactive-hover dark:group-hover:text-dark-text-interactive-hover"
  >
    Carts
  </a>
</div>
```

into this:

```html
<div class="a b c d e f g h i j k l m n o p">
  <a href="#" class="q r s t u v y z A B">
    Carts
  </a>
</div>
```

_439 characters of class names reduced to 50 characters! (**89% less**)_

Breezify uses AST tree parsing and manipulations for JS and CSS to carefully transform the code, so in JS it turns this:

```js
const mySpecialClass = "primary-color";
const decorated = "decorated";

const header = document.querySelector(
  `.header[role='decorated']:not(.decorated) .aside, ${decorated}, aside > .aside, ${mySpecialClass}`,
);
```

into this:

```js
const mySpecialClass = "a";
const decorated = "b";

const header = document.querySelector(
  `.c[role='decorated']:not(.b) .d, ${decorated}, aside > .d, ${mySpecialClass}`,
);
```

In CSS, it turns this:

```css
.focus\:border-\[blue-500\]:focus {
    border-color: #4299e1;
}

.group:hover .group-hover\:text-\[blue-400\] {
    color: #63b3ed;
}
```

into this:

```css
.a:focus {
  border-color: #4299e1;
}

.b:hover .c {
  color: #63b3ed;
}
```

It also **works with inline scripts and styles**, and it's customizable to fit your needs.

## Reasons

Every byte counts – money, load times, performance, and user experience.

## Debugging

In case of code in most cases there is no much difference between your class name and any other string. So when Breezify replaces your class name with a new one there is a possibility of replacing the wrong value which can cause a bug.

### Best Practice: Use Prefix for Class Names

The best way to run Breezify without any issues is to prefix your class names with a unique prefix, like `tw-` for Tailwind CSS. You can also use `includeClassPatterns` and `ignoreClassPatterns` options to include or ignore class names by patterns.

```js
{
  css: {
    includeClassPatterns: ["^tw-"],
    ignoreClassPatterns: ["^ProseMirror"],
  }
}
```

### Prefix your Breezify Class Names for Debugging

To make it easier to find and fix bugs, you can add a prefix to the class names in the config file. When you see a bug, you can find this place in the code and replace a conflicting class name with a safe one in your source files. After that you can remove the prefix.

```js
{
  css: {
    prefix: "breezify-",
  }
}
```

### Use Custom Skip Rules for JS

If you have a problem with JS, you can use skip rules to ignore certain nodes when replacing the class names. See [ESTree](https://github.com/estree/estree), [Acorn](https://github.com/acornjs/acorn), and [example skip rules](https://github.com/glebgorokhov/breezify/blob/main/src/skip-rules/index.ts).

Example:

```ts
/**
 * Skip local storage methods
 * @param node {AnyNode} - AST node
 * @param ancestors {AnyNode[]} - Ancestors of the AST node
 */
function skipLocalStorageMethods(
  node: AnyNode,
  ancestors: AnyNode[],
): boolean {
  return (
    ancestors[ancestors.length - 2]?.callee?.object?.name === "localStorage"
  );
}

const options: BreezifyOptions = {
  js: {
    skipRules: [skipLocalStorageMethods],
  }
}
```

This will ignore class names in the `localStorage` methods, for example, in this case:

```ts
localStorage.setItem("favoriteClassName", "myClassName");
```

# Breezify Options API Documentation

## BreezifyOptions

Options for configuring Breezify.

- `config` (string): The path to the Breezify config file.
- `ignoreConfig` (boolean): Whether to ignore the config file.
- `files` (FilesOptions): Configuration options for file handling.
- `css` (CSSOptions): Configuration options for CSS processing.
- `js` (JSOptions): Configuration options for JavaScript processing.
- `html` (HTMLOptions): Configuration options for HTML processing.

## FilesOptions

Options related to file handling.

- `buildDir` (string): The directory where the files are located. Default: `"dist"`.
- `outputDir` (string | undefined): The directory where the files should be outputted.
- `pattern` (string): The pattern to match files relative to the build folder. Default: `"**/*.{css,js,html}"`. See [glob](https://www.npmjs.com/package/glob) for pattern syntax.
- `ignore` (string[]): The RegExp patterns to ignore. Use as strings, without modifiers. Example: `["^node_modules/"]`.

## CSSOptions

Options for CSS processing.

- `includeClassPatterns` (string[] | undefined): The RegExp patterns to include. Example: `["^tw-"]` for class names with "tw-" prefix.
- `ignoreClassPatterns` (string[] | undefined): The RegExp patterns to ignore. Use as strings, without modifiers. Example: `["^ProseMirror"]` for class names with "ProseMirror" prefix.
- `shuffle` (boolean | undefined): Whether to shuffle class names. Default: `true`.
- `prefix` (string | undefined): The prefix to add to the class names.
- `minify` (boolean | undefined): Whether to minify the output CSS. Default: `true`.
- `extractClassesFromHtml` (boolean | undefined): Whether to extract class names from <style> tags found in HTML files. Default: `true`.
- `restructure` (boolean | undefined): Whether to restructure the output CSS with CSSO for more efficient minification. Default: `true`.
- `forceMediaMerge` (boolean | undefined): Whether to force merging media queries with CSSO for more efficient minification. Default: `true`.

## JSOptions

Options for JavaScript processing.

- `ignoreStringPatterns` (string[] | undefined): The RegExp patterns to ignore when replacing class names in strings in JS files. Use as strings, without modifiers. Example: `["^%s"]`.
- `skipRules` (SkipRule[] | undefined): Skip rules to ignore certain nodes. See [ESTree](https://github.com/estree/estree), [Acorn](https://github.com/acornjs/acorn), and [example skip rules](https://github.com/glebgorokhov/breezify/blob/main/src/skip-rules/index.ts).
- `mode` ("acorn" | "simple" | undefined): The mode to use for parsing JS files. Default: `"acorn"`.
- `minify` (boolean | undefined): Whether to minify the output JS. Default: `true`.
- `minifyInlineJS` (boolean | undefined): Whether to minify inline JS (inside HTML files). Default: `true`.

## HTMLOptions

Options for HTML processing.

- `attributes` (string[]): The attributes you use for class names in HTML files. You may want to include some data attributes in addition to default. Default: `["class"]`.
- `beautify` (boolean | PrettyOptions | undefined): Whether to beautify the output HTML.
- `minify` (boolean | Options | undefined): Whether to minify the output HTML. If `true`, `minifyHtmlDefaultOptions` will be used. See [html-minifier](https://www.npmjs.com/package/html-minifier).

## Default configuration

```javascript
const options = {
  files: {
    buildDir: "dist",
    pattern: "**/*.{css,js,html}",
    ignore: [],
  },
  css: {
    sourceMap: true,
    shuffle: true,
    minify: true,
    extractClassesFromHtml: true,
  },
  js: {
    mode: "acorn",
    minify: true,
    minifyInlineJS: true,
  },
  html: {
    attributes: ["class"],
    minify: true,
  },
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 

## Contributing

I appreciate any help with the project!

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for details.

