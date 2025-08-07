// import path from 'path'

// export default {
//   plugins: {
//     "@tailwindcss/postcss": {
//       base: path.join(import.meta.dirname, './src'),
//     },
//   }
// }

const path = require('path')

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      base: path.join(__dirname, './src'),
    },
  },
}
