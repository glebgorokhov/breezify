// Replace class names in HTML content with care
export function replaceClassNamesInHtml(
  content: string,
  classMap: Record<string, string>,
): string {
  return content.replace(/class=["']([^"']*)["']/g, (match, classNames) => {
    return `class="${classNames
      .split(/\s+/)
      .map((className: string) => classMap[className] || className)
      .join(" ")}"`;
  });
}
