import { defineConfig } from "tsdown";
export default defineConfig({
  entry: ["src/init.ts", "src/fs.ts", "src/run.ts", "src/swagger.ts", "src/type.ts"],
  format: ["es"],
  dts: true,
  minify: true,
  outDir:"tsdown-dist"
})