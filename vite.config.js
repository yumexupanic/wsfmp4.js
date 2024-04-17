import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/wsfmp4.js",
      name: "wsfmp4",
      formats: ["es", "umd", "iife", "cjs"],
      fileName: (format) => {
        if (format == 'es') {
          return `wsfmp4.js`
        }
        return `wsfmp4.${format}.js`
      },
    }
  },
});
