const colors = reactive({
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
const mode = useColorMode({
  attribute: "data-theme",
  modes: {
    dark: "dark",
    light: "cupcake",
  },
})
watch(
  mode,
  () => {
    nextTick(() => {
      const computedStyles = getComputedStyle(document.querySelector(":root"))
      Object.entries(colors).forEach(([key]) => {
        colors[key] = `oklch(${computedStyles.getPropertyValue(`--${key}`)})`
      })
    })
  },
  { immediate: true },
)

import d from "daisyui/src/theming/themes"
console.log()

function getColor([k1,k2], [a1,a2] = [1,1]) {
  return computed(() => {
    if (mode.value == "dark")
      return darkColors[k1] + (Math.floor(255*a1)).toString(16)
    return lightColors[k2] + (Math.floor(255*a2)).toString(16)
  })
}

const darkColors = Object.assign(d.dark, d.dracula)
const lightColors = Object.assign(d.light, d.cupcake)

export { colors, mode, getColor, darkColors, lightColors }
