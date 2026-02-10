export const isDark = useDark({ attribute: "data-theme", valueLight: "tokyonight-light", valueDark: "tokyonight" })
export const toggleDark = useToggle(isDark)
