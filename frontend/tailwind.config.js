/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0C1018',
        panel: '#111820',
        'panel-2': '#161E28',
        line: '#1C2635',
        'line-2': '#131C27',
        ink: '#E8EDF4',
        'ink-2': '#8A9AAD',
        faint: '#50606F',
        accent: '#B8C6D4',
        sev: {
          red: '#C05A53',
          amber: '#C8965A',
          green: '#4FAF8A',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '2px',
        md: '3px',
        lg: '4px',
        xl: '6px',
        '2xl': '8px',
        full: '2px',
      },
      letterSpacing: {
        kicker: '0.12em',
      },
    },
  },
  plugins: [],
}
