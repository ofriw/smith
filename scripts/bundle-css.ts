/**
 * Bundle CSS files by resolving @import statements
 * Run this before starting the dev server
 */

const CSS_ENTRY = "client/index.css";
const CSS_OUTPUT = "client/bundled.css";

async function resolveImports(cssContent: string, basePath: string): Promise<string> {
  const importRegex = /@import\s+["']([^"']+)["'];?/g;
  let result = cssContent;
  let match;

  // Collect all imports
  const imports: { fullMatch: string; path: string }[] = [];
  while ((match = importRegex.exec(cssContent)) !== null) {
    imports.push({ fullMatch: match[0], path: match[1] });
  }

  // Process imports in order
  for (const { fullMatch, path } of imports) {
    const fullPath = `${basePath}/${path}`.replace(/\/\.\//g, "/");
    try {
      let importedContent = await Deno.readTextFile(fullPath);
      // Recursively resolve imports in the imported file
      const importBasePath = fullPath.substring(0, fullPath.lastIndexOf("/"));
      importedContent = await resolveImports(importedContent, importBasePath);
      result = result.replace(fullMatch, `/* === ${path} === */\n${importedContent}\n`);
    } catch (e) {
      console.error(`Failed to import ${fullPath}:`, e);
      result = result.replace(fullMatch, `/* Failed to import: ${path} */`);
    }
  }

  return result;
}

async function main() {
  console.log("Bundling CSS...");
  const cssContent = await Deno.readTextFile(CSS_ENTRY);
  const basePath = CSS_ENTRY.substring(0, CSS_ENTRY.lastIndexOf("/"));
  const bundled = await resolveImports(cssContent, basePath);
  await Deno.writeTextFile(CSS_OUTPUT, bundled);
  console.log(`CSS bundled to ${CSS_OUTPUT}`);
}

main();
