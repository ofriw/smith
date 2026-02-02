import { startDebugServer } from "@goatdb/goatdb/server/build";

startDebugServer({
  buildDir: "build",
  path: ".smith/data",
  jsPath: "client/app.tsx",
  htmlPath: "client/index.html",
  cssPath: "client/index.css",
  assetsPath: "client/assets",
  watchDir: ".",
  orgId: "smith",
});
