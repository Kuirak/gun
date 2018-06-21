import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

export default [
  // browser-friendly UMD build
  {
    input: "src/index.js",
    output: {
      name: "Gun",
      file: pkg.browser,
      format: "umd"
    },
    plugins: [resolve(), commonjs()]
  }
];
