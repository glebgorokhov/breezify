<img src="./logo_light.svg#gh-light-mode-only" alt="logo" width="200" />
<img src="./logo_dark.svg#gh-dark-mode-only" alt="logo" width="200" />

# Breezify

Give some fresh air to your production HTML, JS and CSS! Breezify is a library that replaces class names in your build files with shorter ones.

Navigation: 

- [Installation](#installation)
- [Abstract](#abstract)
- [Ask Question / Discuss](#ask-question-or-discuss)
- [Reasons](#reasons)
- [Breezify Options API Documentation](#breezify-options-api-documentation)
- [License](#license)
- [Contributing](./CONTRIBUTING.md)

## Installation

1. `npm i -g breezify`
2. `breezify init` in your project folder to create a config file

### CLI usage

- Update your build command in package.json like that: `{ "build": "your-build-command && breezify do" }`
- Use `breezify do -h` for the list of options

### API usage

```js
const breezify = require('breezify');

breezify(options?: BreezifyOptions);
```

## Ask Question or Discuss

- [Create an issue](https://github.com/glebgorokhov/breezify/issues/new)
- [Join the Telegram group](https://t.me/breezifychat)

## Donations

If you like the project and want to support it, you can donate to the author:

- [GitHub Sponsors](https://github.com/sponsors/glebgorokhov)
- [BuyMeACoffee](https://www.buymeacoffee.com/glebgorokhov)

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

- Every byte counts – money, performance, and user experience
- Faster DOM manipulations and CSS selector matching. Proof:

```js
function testPerformance(func) {
  let count = 0;
  const startTime = performance.now();
  const duration = 1000; // milliseconds

  while (performance.now() - startTime < duration) {
    func(); // Call the target function
    count++; // Increment the counter
  }

  return count;
}

testPerformance(() => { document.querySelector("highlight") }) // 43,457 operations
testPerformance(() => { document.querySelector("a") }) // 1,290,237 operations (30x faster)
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
- `ignore` (string[]): The RegExp patterns to ignore.

## CSSOptions

Options for CSS processing.

- `includeClassPatterns` (string[] | undefined): The RegExp patterns to include. Example: `["^tw-"]` for class names with "tw-" prefix.
- `ignoreClassPatterns` (string[] | undefined): The RegExp patterns to ignore.
- `sourceMap` (boolean): Whether to generate source maps. Default: `true`.
- `shuffle` (boolean | undefined): Whether to shuffle class names. Default: `true`.
- `prefix` (string | undefined): The prefix to add to the class names.
- `minify` (boolean | undefined): Whether to minify the output CSS. Default: `true`.

## JSOptions

Options for JavaScript processing.

- `ignoreStringPatterns` (string[] | undefined): The RegExp patterns to ignore when replacing class names in strings in JS files.
- `skipRules` (SkipRule[] | undefined): Skip rules to ignore certain nodes. See [ESTree](https://github.com/estree/estree), [Acorn](https://github.com/acornjs/acorn), and [example skip rules](https://github.com/glebgorokhov/breezify/blob/main/src/skip-rules/index.ts).
- `mode` ("acorn" | "simple" | undefined): The mode to use for parsing JS files. Default: `"acorn"`.
- `minify` (boolean | undefined): Whether to minify the output JS. Default: `true`.
- `minifyInlineJS` (boolean | undefined): Whether to minify inline JS (inside HTML files). Default: `true`.

## HTMLOptions

Options for HTML processing.

- `attributes` (string[]): The attributes to minify in HTML files. Default: `["class"]`.
- `beautify` (boolean | PrettyOptions | undefined): Whether to beautify the output HTML.
- `minify` (boolean | Options | undefined): Whether to minify the output HTML. If `true`, `minifyHtmlDefaultOptions` will be used. See [html-minifier](https://www.npmjs.com/package/html-minifier).

## Default configuration

```javascript
{
  files: {
    buildDir: "dist",
    pattern: "**/*.{css,js,html}",
    ignore: [],
  },
  css: {
    sourceMap: true,
    shuffle: true,
    minify: true,
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




