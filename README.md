<img src="./logo_light.svg#gh-light-mode-only" alt="logo" width="200" />
<img src="./logo_dark.svg#gh-dark-mode-only" alt="logo" width="200" />

# Breezify

Give some fresh air to your production HTML, JS and CSS! Breezify is a library that replaces class names in your build files with shorter ones.

## Abstract

When you are developing a website, you often use long class names to make your code more readable. 

Another case is using **Tailwind CSS** or similar libraries, where you have to use lots of classes to style your elements.  

However, when you are ready to deploy your website, you want to minify your code to make it faster. Breezify is a library that replaces class names in your HTML, JS and CSS files with shorter ones. This way, you can keep your code readable during development and minify it for production.

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

_439 characters of class names reduced to 50 characters! (**90% less**)_

## Why?

- Reduced File Size
- Improved Performance
- Better Caching Efficiency
- Optimization for Content Delivery Networks (CDNs)
- Enhanced Compression Ratios
- Cost Savings in Hosting and Bandwidth
- Improved Parsing Speed by Browsers
- Simplification for JavaScript Interactions
- SEO Benefits

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




