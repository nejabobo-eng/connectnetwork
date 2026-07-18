import type { Config } from 'tailwindcss'

export default {
  content: [
	'./pages/**/*.{js,ts,jsx,tsx,mdx}',
	'./components/**/*.{js,ts,jsx,tsx,mdx}',
	'./app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
	extend: {
	  colors: {
		primary: '#0A4D8C',
		secondary: '#2E8B57',
	  },
	  boxShadow: {
		soft: '0 10px 30px rgba(0,0,0,0.08)'
	  }
	},
  },
  plugins: [],
} satisfies Config
