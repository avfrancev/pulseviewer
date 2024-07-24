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

export { colors, mode }
