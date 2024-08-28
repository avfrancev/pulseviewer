import { fileURLToPath, URL } from "node:url"

import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import vueDevTools from "vite-plugin-vue-devtools"

import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import Icons from "unplugin-icons/vite"
// import { FileSystemIconLoader } from "unplugin-icons/loaders"
import IconsResolver from "unplugin-icons/resolver"
import arraybuffer from "vite-plugin-arraybuffer"
import { viteSingleFile } from "vite-plugin-singlefile"
import { compression } from "vite-plugin-compression2"
import RadixVueResolver from "radix-vue/resolver"

const buildForESP32 = process.env.ESP32 // single file with gzip

// console.log(process.env);


// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development"
  
  return {
    plugins: [
      vue({
        vueCompilerOptions: {
          plugins: ["@vue/language-plugin-pug"],
        },
      }),
      vueJsx(),
      // vueDevTools(),
      arraybuffer(),
      compression(),
      // tarball(),
      buildForESP32 &&
        viteSingleFile({
          // useRecommendedBuildConfig: false,
          // removeViteModuleLoader: true,
        }),
      Components({
        extensions: ["vue", "md", "js"],
        include: [/\.vue$/, /\.vue\?vue/, /\.js$/],
        dts: "./components.d.ts",
        dirs: ["src/components", "src/modules"],
        resolvers: [
          RadixVueResolver(),
          IconsResolver({
            customCollections: ["custom", "inline"],
          }),
        ],
      }),
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        // global imports to register
        imports: [
          // presets
          "pinia",
          "vue",
          "@vueuse/core",
          // custom
        ],
        dts: "./auto-imports.d.ts",
        resolvers: [ElementPlusResolver()],
        vueTemplate: false,
        viteOptimizeDeps: true,
        eslintrc: {
          enabled: true, // Default `false`
          // provide path ending with `.mjs` or `.cjs` to generate the file with the respective format
          filepath: "./.eslintrc-auto-import.json", // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
      }),
      Icons({
        compiler: "vue3",
        autoInstall: true,
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  }
})
