import typescript from "rollup-plugin-typescript2";

module.exports = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "umd",
    name: "vuexEnhancedRouterSync",
    sourcemap: true
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          sourceMap: true,
          inlineSourceMap: false
        }
      }
    })
  ]
};
