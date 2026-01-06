// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      'no-trailing-spaces': 'off',
      'vue/multiline-html-element-content-newline': 'off'
    }
  }
)
