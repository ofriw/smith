import { compile, type TargetOS, type CPUArch } from "@goatdb/goatdb/server/build";

// Map Deno.build values to GoatDB's TargetOS/CPUArch
const osMap: Record<string, TargetOS> = {
  darwin: "mac",
  linux: "linux",
  windows: "windows",
};

const archMap: Record<string, CPUArch> = {
  aarch64: "arm64",
  x86_64: "x64",
};

// Bundle CSS first
const bundleCss = new Deno.Command("deno", {
  args: ["run", "-A", "scripts/bundle-css.ts"],
}).outputSync();

if (!bundleCss.success) {
  console.error("Failed to bundle CSS");
  Deno.exit(1);
}

compile({
  buildDir: "build",
  serverEntry: "server/mod.ts",
  jsPath: "client/app.tsx",
  htmlPath: "client/index.html",
  cssPath: "client/bundled.css",
  assetsPath: "client/assets",
  os: osMap[Deno.build.os] ?? "linux",
  arch: archMap[Deno.build.arch] ?? "x64",
  appName: "smith",
});
