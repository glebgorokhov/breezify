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

- **Maximum File Size Reduction**: Utilizing ultra-short class names in production minimizes CSS, HTML, and JavaScript file sizes, leading to faster load times.
- **Optimal Performance**: The reduced file sizes ensure peak performance, especially beneficial for users on limited bandwidth connections.
- **Superior Caching**: Smaller files get cached more efficiently, speeding up repeat visits and improving user experience without affecting development workflow.
- **Enhanced Minification Efficiency**: These concise class names enhance the efficiency of minification and compression, reducing file sizes more than traditional optimizations.
- **Seamless Development Experience**: Since class names are only shortened in production, developers can work with descriptive names during development, ensuring ease of maintenance without additional documentation.
- **Faster CDN Delivery**: The smaller file sizes improve speed across Content Delivery Networks, enhancing global site accessibility and performance.
- **Improved Compression Ratios**: Short, repetitive class names lead to better compression, resulting in smaller file sizes during transmission.
- **Reduced Hosting and Bandwidth Costs**: Smaller files translate to lower data transfer costs, particularly beneficial for high-traffic sites.
- **Quicker Browser Parsing and Rendering**: The reduced data volume allows browsers to parse and apply styles faster, contributing to a quicker user interface.
- **Efficient JavaScript Interactions**: With class names being shortened only in production, JavaScript development can use meaningful names, while production benefits from efficiency in DOM manipulation.
- **Indirect SEO Benefits**: Enhanced loading times and site performance can positively influence search engine rankings due to better user experience metrics.
- **Automatic Debugging Compatibility**: The build process simplifies debugging since developers work with meaningful class names, with the conversion to shorter names happening automatically for production.

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




