// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Extended color palette if needed
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        // Custom spacing if needed
      },
      boxShadow: {
        // Custom shadows if needed
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [
    // Plugins if needed
    // Add the following plugin to hide Chrome DevTools element (cz-shortcut-listen)
    function({ addBase }) {
      addBase({
        '.cz-shortcut-listen, body > .cz-shortcut-listen': {
          display: 'none !important',
          margin: '0 !important',
          padding: '0 !important',
          border: 'none !important',
          opacity: '0 !important',
          visibility: 'hidden !important',
          width: '0 !important',
          height: '0 !important',
          overflow: 'hidden !important',
        },
      });
    },
  ],
}