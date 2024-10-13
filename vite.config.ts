import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { createRoutes } from "@fleak-org/remix-convention";

import { remixRoutes } from "remix-routes/vite";

installGlobals();

export default defineConfig({
  ssr: {
    noExternal: ["@fleak-org/remix-utils"],
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*"],
      routes(defineRoutes) {
        return createRoutes(defineRoutes, {
          routesDirectory: "routes",
        });
      },
      serverModuleFormat: "esm",
    }),
    remixRoutes({
      outDir: "./types",
    }),

    tsconfigPaths(),
  ],
});
