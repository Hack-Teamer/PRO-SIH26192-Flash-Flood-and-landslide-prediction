/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#12181B',
          card: '#1B2327',
          border: '#2A363D',
          hover: '#243036',
          text: '#E1E7ED',
          muted: '#8A99A6'
        },
        terrain: '#3F5C4C',
        signal: {
          cyan: '#3FD0C9',
          amber: '#F59E0B'
        },
        risk: {
          green: '#4C9A6A',
          yellow: '#D9B44A',
          orange: '#D97F35',
          red: '#C43D3D'
        }
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"IBM Plex Sans Condensed"', 'sans-serif'],
        body: ['Inter', '"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace']
      },
      animation: {
        'pulse-once': 'pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) 1',
        'heartbeat': 'heartbeat 2s infinite ease-in-out',
        'flash-alert': 'flashRed 0.8s ease-in-out infinite alternate'
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' }
        },
        heartbeat: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' }
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(196, 61, 61, 0.15)' },
          '100%': { backgroundColor: 'rgba(196, 61, 61, 0.55)' }
        }
      }
    },
  },
  plugins: [],
}
