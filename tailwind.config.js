/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
background: {'50': 'oklch(var(--background-50) / <alpha-value>)', '100': 'oklch(var(--background-100) / <alpha-value>)', '200': 'oklch(var(--background-200) / <alpha-value>)', '300': 'oklch(var(--background-300) / <alpha-value>)', '400': 'oklch(var(--background-400) / <alpha-value>)', '500': 'oklch(var(--background-500) / <alpha-value>)', '600': 'oklch(var(--background-600) / <alpha-value>)', '700': 'oklch(var(--background-700) / <alpha-value>)', '800': 'oklch(var(--background-800) / <alpha-value>)', '900': 'oklch(var(--background-900) / <alpha-value>)', '950': 'oklch(var(--background-950) / <alpha-value>)'},
    foreground: {'50': 'oklch(var(--foreground-50) / <alpha-value>)', '100': 'oklch(var(--foreground-100) / <alpha-value>)', '200': 'oklch(var(--foreground-200) / <alpha-value>)', '300': 'oklch(var(--foreground-300) / <alpha-value>)', '400': 'oklch(var(--foreground-400) / <alpha-value>)', '500': 'oklch(var(--foreground-500) / <alpha-value>)', '600': 'oklch(var(--foreground-600) / <alpha-value>)', '700': 'oklch(var(--foreground-700) / <alpha-value>)', '800': 'oklch(var(--foreground-800) / <alpha-value>)', '900': 'oklch(var(--foreground-900) / <alpha-value>)', '950': 'oklch(var(--foreground-950) / <alpha-value>)'},
    primary: {'50': 'oklch(var(--primary-50) / <alpha-value>)', '100': 'oklch(var(--primary-100) / <alpha-value>)', '200': 'oklch(var(--primary-200) / <alpha-value>)', '300': 'oklch(var(--primary-300) / <alpha-value>)', '400': 'oklch(var(--primary-400) / <alpha-value>)', '500': 'oklch(var(--primary-500) / <alpha-value>)', '600': 'oklch(var(--primary-600) / <alpha-value>)', '700': 'oklch(var(--primary-700) / <alpha-value>)', '800': 'oklch(var(--primary-800) / <alpha-value>)', '900': 'oklch(var(--primary-900) / <alpha-value>)', '950': 'oklch(var(--primary-950) / <alpha-value>)'},
    secondary: {'50': 'oklch(var(--secondary-50) / <alpha-value>)', '100': 'oklch(var(--secondary-100) / <alpha-value>)', '200': 'oklch(var(--secondary-200) / <alpha-value>)', '300': 'oklch(var(--secondary-300) / <alpha-value>)', '400': 'oklch(var(--secondary-400) / <alpha-value>)', '500': 'oklch(var(--secondary-500) / <alpha-value>)', '600': 'oklch(var(--secondary-600) / <alpha-value>)', '700': 'oklch(var(--secondary-700) / <alpha-value>)', '800': 'oklch(var(--secondary-800) / <alpha-value>)', '900': 'oklch(var(--secondary-900) / <alpha-value>)', '950': 'oklch(var(--secondary-950) / <alpha-value>)'},
    accent: {'50': 'oklch(var(--accent-50) / <alpha-value>)', '100': 'oklch(var(--accent-100) / <alpha-value>)', '200': 'oklch(var(--accent-200) / <alpha-value>)', '300': 'oklch(var(--accent-300) / <alpha-value>)', '400': 'oklch(var(--accent-400) / <alpha-value>)', '500': 'oklch(var(--accent-500) / <alpha-value>)', '600': 'oklch(var(--accent-600) / <alpha-value>)', '700': 'oklch(var(--accent-700) / <alpha-value>)', '800': 'oklch(var(--accent-800) / <alpha-value>)', '900': 'oklch(var(--accent-900) / <alpha-value>)', '950': 'oklch(var(--accent-950) / <alpha-value>)'},
    sky: {'50': 'oklch(var(--sky-50) / <alpha-value>)', '100': 'oklch(var(--sky-100) / <alpha-value>)', '200': 'oklch(var(--sky-200) / <alpha-value>)', '300': 'oklch(var(--sky-300) / <alpha-value>)', '400': 'oklch(var(--sky-400) / <alpha-value>)', '500': 'oklch(var(--sky-500) / <alpha-value>)', '600': 'oklch(var(--sky-600) / <alpha-value>)', '700': 'oklch(var(--sky-700) / <alpha-value>)', '800': 'oklch(var(--sky-800) / <alpha-value>)', '900': 'oklch(var(--sky-900) / <alpha-value>)', '950': 'oklch(var(--sky-950) / <alpha-value>)'},
    violet: {'50': 'oklch(var(--violet-50) / <alpha-value>)', '100': 'oklch(var(--violet-100) / <alpha-value>)', '200': 'oklch(var(--violet-200) / <alpha-value>)', '300': 'oklch(var(--violet-300) / <alpha-value>)', '400': 'oklch(var(--violet-400) / <alpha-value>)', '500': 'oklch(var(--violet-500) / <alpha-value>)', '600': 'oklch(var(--violet-600) / <alpha-value>)', '700': 'oklch(var(--violet-700) / <alpha-value>)', '800': 'oklch(var(--violet-800) / <alpha-value>)', '900': 'oklch(var(--violet-900) / <alpha-value>)', '950': 'oklch(var(--violet-950) / <alpha-value>)'},
    amber: {'50': 'oklch(var(--amber-50) / <alpha-value>)', '100': 'oklch(var(--amber-100) / <alpha-value>)', '200': 'oklch(var(--amber-200) / <alpha-value>)', '300': 'oklch(var(--amber-300) / <alpha-value>)', '400': 'oklch(var(--amber-400) / <alpha-value>)', '500': 'oklch(var(--amber-500) / <alpha-value>)', '600': 'oklch(var(--amber-600) / <alpha-value>)', '700': 'oklch(var(--amber-700) / <alpha-value>)', '800': 'oklch(var(--amber-800) / <alpha-value>)', '900': 'oklch(var(--amber-900) / <alpha-value>)', '950': 'oklch(var(--amber-950) / <alpha-value>)'},
    leaf: {'50': 'oklch(var(--leaf-50) / <alpha-value>)', '100': 'oklch(var(--leaf-100) / <alpha-value>)', '200': 'oklch(var(--leaf-200) / <alpha-value>)', '300': 'oklch(var(--leaf-300) / <alpha-value>)', '400': 'oklch(var(--leaf-400) / <alpha-value>)', '500': 'oklch(var(--leaf-500) / <alpha-value>)', '600': 'oklch(var(--leaf-600) / <alpha-value>)', '700': 'oklch(var(--leaf-700) / <alpha-value>)', '800': 'oklch(var(--leaf-800) / <alpha-value>)', '900': 'oklch(var(--leaf-900) / <alpha-value>)', '950': 'oklch(var(--leaf-950) / <alpha-value>)'},
        /* warm helper used by older components: maps to the brand amber/cream */
        sand: { '50': '#FFFBF3', '100': '#FFF4DE', '200': '#FBE8C4', '300': '#F2D8A8', '400': '#E8B96A', '500': '#F5A63A', '600': '#C9822B', '700': '#8A5A1E' },
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        label: ['var(--font-label)'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.75rem' },
      boxShadow: { card: 'var(--shadow-card)', lift: 'var(--shadow-lift)', pop: 'var(--shadow-pop)' },
      keyframes: {
        celebratePop: { '0%': { opacity: '0', transform: 'scale(.6)' }, '60%': { opacity: '1', transform: 'scale(1.06)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        confettiFall: { '0%': { opacity: '0', transform: 'translateY(-15vh) rotate(0)' }, '12%': { opacity: '1' }, '100%': { opacity: '1', transform: 'translateY(115vh) rotate(680deg)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        riseIn: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        twinkle: { '0%,100%': { opacity: '.35', transform: 'scale(.9)' }, '50%': { opacity: '1', transform: 'scale(1.12)' } },
        jamoolWave: { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-2.5deg)' }, '75%': { transform: 'rotate(2.5deg)' } },
        jamoolCheer: { '0%,100%': { transform: 'translateY(0)' }, '40%': { transform: 'translateY(-14px)' }, '60%': { transform: 'translateY(0)' } },
        drift: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-40px)' } },
      },
      animation: {
        'celebrate-pop': 'celebratePop .5s cubic-bezier(.23,1,.32,1) both',
        'confetti-fall': 'confettiFall 3.2s linear forwards',
        floaty: 'floaty 5s ease-in-out infinite',
        'rise-in': 'riseIn .7s cubic-bezier(.23,1,.32,1) both',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'jamool-wave': 'jamoolWave 4s ease-in-out infinite',
        'jamool-cheer': 'jamoolCheer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};