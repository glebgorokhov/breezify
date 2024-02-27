/**
 * Escape special characters in a string
 * @param str {string} - The string to escape
 */
export function escapeString(str: string) {
  return str
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, "\\n") // Escape newlines
    .replace(/\r/g, "\\r") // Escape carriage returns
    .replace(/\t/g, "\\t"); // Escape tabs
}
