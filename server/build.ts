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

compile({
  buildDir: "build",
  serverEntry: "server/mod.ts",
  jsPath: "client/app.tsx",
  htmlPath: "client/index.html",
  cssPath: "client/index.css",
  assetsPath: "client/assets",
  os: osMap[Deno.build.os] ?? "linux",
  arch: archMap[Deno.build.arch] ?? "x64",
  appName: "smith",
});
