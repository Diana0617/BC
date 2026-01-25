/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Color principal - Dinámico desde BrandingContext usando variables CSS
        branded: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
          accent: 'var(--color-accent)',
        },
        // Color principal - Pink/Fucsia (para CTAs y elementos destacados)
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',  // Color principal fucsia
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        // Color secundario - Purple (complemento del fucsia)
        secondary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',  // Purple para gradientes
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Colores de acento para diferentes funcionalidades
        accent: {
          blue: {
            light: '#06b6d4',   // Cyan
            DEFAULT: '#3b82f6', // Blue
            dark: '#1e40af',
          },
          green: {
            light: '#14b8a6',   // Teal
            DEFAULT: '#10b981', // Green
            dark: '#059669',
          },
          amber: {
            light: '#fbbf24',
            DEFAULT: '#f59e0b',
            dark: '#d97706',
          },
          red: {
            light: '#f87171',
            DEFAULT: '#ef4444',
            dark: '#dc2626',
          },
        },
        // Backgrounds - Blanco y grises
        background: {
          DEFAULT: '#ffffff',      // Fondo principal blanco
          secondary: '#f8fafc',    // Fondo secundario gris muy claro
          tertiary: '#f1f5f9',     // Fondo terciario
          dark: '#1e293b',         // Fondo oscuro (para login, etc)
          'dark-secondary': '#334155', // Fondo oscuro secundario
        },
        // Textos - Grises oscuros
        text: {
          primary: '#1e293b',      // Texto principal - gris muy oscuro
          secondary: '#475569',    // Texto secundario
          tertiary: '#64748b',     // Texto terciario
          disabled: '#94a3b8',     // Texto deshabilitado
          light: '#cbd5e1',        // Texto claro (sobre fondos oscuros)
          'on-dark': '#f8fafc',    // Texto sobre fondo oscuro
        },
        // Bordes
        border: {
          DEFAULT: '#e2e8f0',      // Border por defecto
          light: '#f1f5f9',        // Border claro
          dark: '#cbd5e1',         // Border más visible
          focus: '#ec4899',        // Border en foco (fucsia)
        },
        // Estados
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        info: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        },
        // Colores legacy (mantener compatibilidad con código existente)
        plancyan: {
          DEFAULT: '#06b6d4',
          light: '#67e8f9',
          dark: '#0891b2',
        },
        planred: {
          DEFAULT: '#f87171',
          light: '#fca5a5',
          dark: '#ef4444',
        },
        planyellow: {
          DEFAULT: '#fde047',
          light: '#fef9c3',
          dark: '#facc15',
        },
        planbg: {
          DEFAULT: '#fff',
          dark: '#1e293b',
        },
      },
      fontFamily: {
        'sans': ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'nunito': ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'beauty': '0 4px 14px 0 rgba(236, 72, 153, 0.39)',
        'beauty-lg': '0 8px 25px 0 rgba(236, 72, 153, 0.5)',
        'plan': '0 4px 16px 0 rgba(6,182,212,0.12)',
        'plan-lg': '0 8px 32px 0 rgba(248,113,113,0.18)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'input-focus': '0 0 0 3px rgba(236, 72, 153, 0.1)',
      },
      screens: {
        'xs': '475px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'bounce-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05)',
          },
          '70%': {
            transform: 'scale(0.9)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
        'slide-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'slide-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'pulse-soft': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.8',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        'gradient-green': 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      },
    },
  },
  plugins: [],
}
