/// <reference types="vitest" />

import path from "node:path"
import process from "node:process"
import Vue from "@vitejs/plugin-vue"
import RadixVueResolver from "radix-vue/resolver"
// import UnoCSS from 'unocss/vite'
import AutoImport from "unplugin-auto-import/vite"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import Components from "unplugin-vue-components/vite"
import VueMacros from "unplugin-vue-macros/vite"
import { VueRouterAutoImports } from "unplugin-vue-router"
import VueRouter from "unplugin-vue-router/vite"
import { defineConfig } from "vite"
import { compression } from "vite-plugin-compression2"
import { viteSingleFile } from "vite-plugin-singlefile"

const buildForESP32 = process.env.ESP32 // single file with gzip

export default defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler", // or "modern"
      },
    },
  },
  plugins: [
    // vueDevTools(),
    buildForESP32 && compression(),
    buildForESP32 && viteSingleFile({
      // useRecommendedBuildConfig: false,
      // removeViteModuleLoader: true,
    }),
    VueMacros({
      defineOptions: false,
      defineModels: false,
      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
            defineModel: true,
          },
        }),
      },
    }),

    // https://github.com/posva/unplugin-vue-router
    VueRouter(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "@vueuse/core",
        VueRouterAutoImports,
        {
          // add any other imports you were relying on
          "vue-router/auto": ["useLink"],
        },
      ],
      dts: true,
      dirs: [
        "./src*",
        "./src/modules/**/",
        "./src/composables",
        "./src/models",
        // './node_modules/pulseplot/lib/*.js',
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
      dirs: [
        "./src/components",
        "./src/modules/**/*",
      ],
      resolvers: [
        RadixVueResolver(),
        IconsResolver(),
      ],
    }),

    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    Icons({
      compiler: "vue3",
      autoInstall: true,
    }),
    // UnoCSS(),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    environment: "jsdom",
  },
  // optimizeDeps: {
  //   include: [
  //     './node_modules/pulseplot/lib/*.js',
  //   ],
  // },
})
