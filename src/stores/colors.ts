import { color as d3Color } from "d3-color"
import { interpolateRainbow } from "d3-scale-chromatic"

// daisyUI v5 CSS variable mappings
// v4: --p, --pf, --s, --sf, --a, --af, --b1, --b2, --b3, --bc, --n, --nc
// v5: --color-primary, --color-primary-content, --color-secondary, --color-secondary-content, --color-accent, --color-accent-content, --color-base-100, --color-base-200, --color-base-300, --color-base-content, --color-neutral, --color-neutral-content

const colors: Record<string, string> = reactive({
  p: "",
  pf: "",
  s: "",
  sf: "",
  a: "",
  af: "",
  b1: "",
  b2: "",
  b3: "",
  bc: "",
  n: "",
  nc: "",
})

// CSS variable name mappings (v4 -> v5)
const cssVarMap: Record<string, string> = {
  p: "--color-primary",
  pf: "--color-primary-content",
  s: "--color-secondary",
  sf: "--color-secondary-content",
  a: "--color-accent",
  af: "--color-accent-content",
  b1: "--color-base-100",
  b2: "--color-base-200",
  b3: "--color-base-300",
  bc: "--color-base-content",
  n: "--color-neutral",
  nc: "--color-neutral-content",
}

const mode = useColorMode({
  attribute: "data-theme",
  modes: {
    // dark: 'dark',
    // light: 'cupcake'
  },
})

watch(
  mode,
  () => {
    nextTick(() => {
      const rootElement = document.querySelector(":root")
      if (!rootElement)
        return
      const computedStyles = getComputedStyle(rootElement)
      for (const key of Object.keys(colors)) {
        const v5Var = cssVarMap[key]
        const value = computedStyles.getPropertyValue(v5Var).trim()
        if (value) {
          colors[key] = `oklch(${value})`
        }
      }
    })
  },
  { immediate: true },
)

// Tokyo Night dark theme colors (v5)
type ThemeColors = Record<string, string>

const tokyonightColors: ThemeColors = {
  p: "60% 0.2 250", // #7aa2f7 - primary
  pf: "15% 0.02 250", // primary-content
  s: "65% 0.15 280", // #bb9af7 - secondary
  sf: "15% 0.02 280", // secondary-content
  a: "70% 0.15 210", // #7dcfff - accent
  af: "15% 0.02 210", // accent-content
  b1: "12% 0.03 255", // #1a1b26 - base-100
  b2: "18% 0.04 255", // #24283b - base-200
  b3: "28% 0.05 255", // #414868 - base-300
  bc: "85% 0.03 255", // #c0caf5 - base-content
  n: "40% 0.05 255", // #565f89 - neutral
  nc: "90% 0.02 255", // neutral-content
}

// Tokyo Night Light theme colors (inverted)
const tokyonightLightColors: ThemeColors = {
  p: "60% 0.2 250", // #7aa2f7 - primary (same as dark)
  pf: "98% 0.02 250", // primary-content
  s: "65% 0.15 280", // #bb9af7 - secondary (same as dark)
  sf: "98% 0.02 280", // secondary-content
  a: "70% 0.15 210", // #7dcfff - accent (same as dark)
  af: "98% 0.02 210", // accent-content
  b1: "92% 0.02 255", // #e1e2e7 - base-100 (inverted)
  b2: "85% 0.03 255", // #c0caf5 - base-200 (inverted)
  b3: "75% 0.04 255", // #a9b1d6 - base-300 (inverted)
  bc: "12% 0.03 255", // #1a1b26 - base-content (inverted)
  n: "40% 0.05 255", // #565f89 - neutral (same as dark)
  nc: "98% 0.02 255", // neutral-content
}

// Combine themes (daisyUI v5 style - later themes override earlier)
const darkColors: ThemeColors = { ...tokyonightColors }
const lightColors: ThemeColors = { ...darkColors, ...tokyonightLightColors }

function getColor([k1, k2]: [string, string], [a1, a2] = [1, 1]) {
  return computed(() => {
    if (mode.value === "dark")
      return `${darkColors[k1]} / ${a1}`
    return `${lightColors[k2]} / ${a2}`
  })
}

export { colors, darkColors, getColor, lightColors, mode }

export const rainbowColors = Array.from(Array.from({ length: 20 })).map((d, i) => {
  return d3Color(interpolateRainbow(i / 20))?.formatHex() as string
})

let usedColors: string[] = []

export function getRandomNotUsedColor(colors: string[] = rainbowColors): string {
  const filteredColors = colors.filter(color => !usedColors.includes(color))
  const randomIndex = Math.floor(Math.random() * filteredColors.length)
  let c = filteredColors[randomIndex]
  if (!c) {
    usedColors = []
    c = getRandomNotUsedColor(colors)
  }
  usedColors.push(c)
  return c as string
}
