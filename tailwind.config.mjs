/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      minHeight: {
        'screen-75': '75vh',
      },
      maxHeight: {
        'screen-75': '75vh',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Mobile-specific utilities
      touchAction: {
        'manipulation': 'manipulation',
        'pan-x': 'pan-x',
        'pan-left': 'pan-left',
        'pan-right': 'pan-right',
        'pan-y': 'pan-y',
        'pan-up': 'pan-up',
        'pan-down': 'pan-down',
        'pinch-zoom': 'pinch-zoom',
        'auto': 'auto',
        'none': 'none',
      },
      // Improved mobile breakpoints
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  plugins: [
    // Custom plugin for mobile optimizations
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Mobile touch improvements
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.touch-pan-x': {
          'touch-action': 'pan-x',
        },
        '.touch-pan-y': {
          'touch-action': 'pan-y',
        },
        // Mobile scroll improvements
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },
        '.scroll-auto': {
          'scroll-behavior': 'auto',
        },
        // Mobile tap highlight
        '.tap-highlight-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.tap-highlight-primary': {
          '-webkit-tap-highlight-color': theme('colors.primary.500'),
        },
        // Mobile performance - NO ANIMATIONS
        '.will-change-transform': {
          'will-change': 'transform',
        },
        '.will-change-opacity': {
          'will-change': 'opacity',
        },
        '.will-change-scroll': {
          'will-change': 'scroll-position',
        },
        // Mobile accessibility
        '.focus-visible-ring': {
          '&:focus-visible': {
            'outline': '2px solid transparent',
            'outline-offset': '2px',
            'box-shadow': `0 0 0 2px ${theme('colors.primary.500')}`,
          },
        },
        // Mobile grid improvements
        '.grid-mobile': {
          'display': 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))',
          'gap': '1rem',
        },
        '.grid-mobile-compact': {
          'display': 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(250px, 1fr))',
          'gap': '0.75rem',
        },
        // Mobile card improvements - NO ANIMATIONS
        '.card-mobile': {
          'padding': '1rem',
          'border-radius': '0.75rem',
          'background': 'rgba(30, 41, 59, 0.5)',
          'backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(71, 85, 105, 0.5)',
          /* Remove transitions for mobile */
        },
        '.card-mobile:active': {
          /* Remove transform for mobile */
        },
        // Mobile button improvements - NO ANIMATIONS
        '.btn-mobile': {
          'min-height': '44px',
          'min-width': '44px',
          'padding': '0.75rem 1rem',
          'font-size': '1rem',
          'border-radius': '0.5rem',
          'touch-action': 'manipulation',
          /* Remove transitions for mobile */
        },
        '.btn-mobile:active': {
          /* Remove transform for mobile */
        },
        // Mobile input improvements
        '.input-mobile': {
          'min-height': '44px',
          'padding': '0.75rem 1rem',
          'font-size': '1rem',
          'border-radius': '0.5rem',
          'background': 'rgba(30, 41, 59, 0.5)',
          'border': '1px solid rgba(71, 85, 105, 0.5)',
          'color': 'white',
          /* Remove transitions for mobile */
        },
        '.input-mobile:focus': {
          'outline': 'none',
          'border-color': theme('colors.primary.500'),
          'box-shadow': `0 0 0 2px ${theme('colors.primary.500')}40`,
        },
        // Mobile modal improvements
        '.modal-mobile': {
          'position': 'fixed',
          'top': '0',
          'left': '0',
          'right': '0',
          'bottom': '0',
          'background': 'rgba(0, 0, 0, 0.8)',
          'backdrop-filter': 'blur(4px)',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'padding': '1rem',
          'z-index': '50',
        },
        '.modal-content-mobile': {
          'background': theme('colors.slate.800'),
          'border-radius': '1rem',
          'padding': '1.5rem',
          'max-width': 'calc(100vw - 2rem)',
          'max-height': 'calc(100vh - 2rem)',
          'overflow-y': 'auto',
          'border': '1px solid rgba(71, 85, 105, 0.5)',
        },
        // Mobile navigation improvements - NO ANIMATIONS
        '.nav-mobile': {
          'position': 'fixed',
          'top': '0',
          'left': '0',
          'right': '0',
          'background': 'rgba(15, 23, 42, 0.95)',
          'backdrop-filter': 'blur(12px)',
          'border-bottom': '1px solid rgba(71, 85, 105, 0.5)',
          'z-index': '40',
        },
        '.nav-mobile-menu': {
          'position': 'absolute',
          'top': '100%',
          'left': '0',
          'right': '0',
          'background': 'rgba(30, 41, 59, 0.98)',
          'backdrop-filter': 'blur(16px)',
          'border-bottom': '1px solid rgba(71, 85, 105, 0.5)',
          'padding': '1rem',
          /* Remove animation for mobile */
        },
        // Mobile search improvements
        '.search-mobile': {
          'position': 'relative',
          'width': '100%',
        },
        '.search-mobile input': {
          'width': '100%',
          'padding': '0.75rem 1rem 0.75rem 2.5rem',
          'background': 'rgba(30, 41, 59, 0.5)',
          'border': '1px solid rgba(71, 85, 105, 0.5)',
          'border-radius': '0.5rem',
          'color': 'white',
          'font-size': '1rem',
        },
        '.search-mobile-icon': {
          'position': 'absolute',
          'left': '0.75rem',
          'top': '50%',
          'transform': 'translateY(-50%)',
          'color': theme('colors.slate.400'),
          'pointer-events': 'none',
        },
        // Mobile list improvements - NO ANIMATIONS
        '.list-mobile': {
          'display': 'flex',
          'flex-direction': 'column',
          'gap': '0.75rem',
        },
        '.list-item-mobile': {
          'padding': '1rem',
          'background': 'rgba(30, 41, 59, 0.5)',
          'border-radius': '0.75rem',
          'border': '1px solid rgba(71, 85, 105, 0.5)',
          /* Remove transitions for mobile */
        },
        '.list-item-mobile:active': {
          /* Remove transform for mobile */
          'background': 'rgba(30, 41, 59, 0.7)',
        },
        // Mobile stats improvements
        '.stats-mobile': {
          'display': 'grid',
          'grid-template-columns': 'repeat(2, 1fr)',
          'gap': '0.75rem',
        },
        '.stat-mobile': {
          'padding': '1rem',
          'background': 'rgba(30, 41, 59, 0.5)',
          'border-radius': '0.75rem',
          'border': '1px solid rgba(71, 85, 105, 0.5)',
          'text-align': 'center',
        },
        // Mobile pagination improvements - NO ANIMATIONS
        '.pagination-mobile': {
          'display': 'flex',
          'justify-content': 'center',
          'align-items': 'center',
          'gap': '0.5rem',
          'margin-top': '1.5rem',
        },
        '.pagination-btn-mobile': {
          'min-width': '44px',
          'min-height': '44px',
          'padding': '0.5rem',
          'border-radius': '0.5rem',
          'background': 'rgba(30, 41, 59, 0.5)',
          'border': '1px solid rgba(71, 85, 105, 0.5)',
          'color': theme('colors.slate.300'),
          /* Remove transitions for mobile */
        },
        '.pagination-btn-mobile:active': {
          /* Remove transform for mobile */
        },
        '.pagination-btn-mobile.active': {
          'background': theme('colors.primary.600'),
          'color': 'white',
        },
        // Mobile animation disable utilities
        '.no-animation-mobile': {
          '@media (max-width: 640px)': {
            'animation': 'none !important',
            'transition': 'none !important',
            'transform': 'none !important',
          },
        },
        '.no-hover-mobile': {
          '@media (max-width: 640px)': {
            '&:hover': {
              'transform': 'none !important',
              'box-shadow': 'none !important',
              'background': 'inherit !important',
            },
          },
        },
        '.no-scale-mobile': {
          '@media (max-width: 640px)': {
            '&:active': {
              'transform': 'none !important',
            },
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
}; 