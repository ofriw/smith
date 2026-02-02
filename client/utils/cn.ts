/**
 * Utility for building className strings.
 * Filters out falsy values and joins with spaces.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
