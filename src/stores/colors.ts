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

// Hardcoded theme colors for daisyUI v5
// These are the actual color values from daisyUI themes
type ThemeColors = Record<string, string>

const cupcakeColors: ThemeColors = {
  p: "59 130 246", // #3b82f6 - primary
  pf: "30 64 175", // #1e40ab - primary-content
  s: "244 114 182", // #f14c99 - secondary
  sf: "190 18 60", // #be123c - secondary-content
  a: "192 132 252", // #c084fc - accent
  af: "126 34 206", // #7e22ce - accent-content
  b1: "255 255 255", // base-100
  b2: "248 250 252", // base-200
  b3: "226 232 240", // base-300
  bc: "30 41 59", // base-content
  n: "148 163 184", // neutral
  nc: "30 41 59", // neutral-content
}

const draculaColors: ThemeColors = {
  p: "82 148 226", // #5294e2 - primary
  pf: "255 255 255",
  s: "189 147 249", // #bd93f9 - secondary
  sf: "255 255 255",
  a: "80 250 123", // #50fa7b - accent
  af: "0 0 0",
  b1: "40 42 54", // #282a36 - base-100
  b2: "68 71 90", // #44475a - base-200
  b3: "98 114 164", // #6272a4 - base-300
  bc: "248 248 242", // #f8f8f2 - base-content
  n: "98 114 164", // neutral
  nc: "248 248 242", // neutral-content
}

// Combine themes (daisyUI v4 style - later themes override earlier)
const darkColors: ThemeColors = { ...draculaColors }
const lightColors: ThemeColors = { ...darkColors, ...cupcakeColors }

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
