export default defineAppConfig({
  ui: {
    fonts: false,
    colors: {
      primary: 'blue',
      neutral: 'slate'
    },
    input: {
      slots: {
        base: 'rounded-sm px-1'
      }
    },
    textarea: {
      slots: {
        base: 'rounded-sm'
      }
    }
  }
})
