<img src="./logo_light.svg#gh-light-mode-only" alt="logo" width="200" />
<img src="./logo_dark.svg#gh-dark-mode-only" alt="logo" width="200" />

# Breezify

Give some fresh air to your production HTML, JS and CSS! Breezify is a library that replaces class names in your build files with shorter ones.

## Abstract

When you are developing a website, you often use long class names to make your code more readable. 

Another case is using **Tailwind CSS** or similar libraries, where you have to use lots of classes to style your elements.  

However, when you are ready to deploy your website, you want to minify your code to make it faster. Breezify is a library that replaces class names in your HTML, JS and CSS files with shorter ones. This way, you can keep your code readable during development and minify it for production.

## Features

- **Any framework**: Breezify updates class names in your production HTML, JS and CSS files, no matter the framework you are using.
- **Any pipeline**: Import to your build pipeline or use from CLI
- **Customizable**: Define which class names you want to replace, use prefixes, and more.

## Installation

- **npm**: `npm install breezify`
- **yarn**: `yarn add breezify`
- **pnpm**: `pnpm add breezify`

## Usage

```javascript
import breezify from "breezify";

breezify(options);
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 




