import typescript from "rollup-plugin-typescript2";
import { uglify } from "rollup-plugin-uglify";

module.exports = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "umd",
    name: "vuexEnhancedRouterSync",
    sourcemap: true,
    globals: {
      vue: "Vue"
    }
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          sourceMap: true,
          inlineSourceMap: false
        }
      }
    }),
    uglify({
      sourcemap: true
    })
  ]
};
