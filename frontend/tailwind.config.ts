import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          2: "hsl(var(--accent-2))",
          3: "hsl(var(--accent-3))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        handwritten: ["var(--font-handwritten)", "cursive"],
        logo: ["var(--font-logo)", "cursive"],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],     // 14px
        base: ['1rem', { lineHeight: '1.6' }],       // 16px
        md: ['1.125rem', { lineHeight: '1.6' }],     // 18px
        lg: ['1.5rem', { lineHeight: '1.4' }],       // 24px
        xl: ['2.25rem', { lineHeight: '1.2' }],      // 36px
        display: ['3.5rem', { lineHeight: '1.1' }],  // 56px
      },
      spacing: {
        'xxs': '6px',
        'xs': '12px',
        'sm': '18px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'irregular-1': '6px 18px 12px 8px',
        'irregular-2': '14px 8px 16px 10px',
        'irregular-3': '10px 16px 8px 14px',
      },
      boxShadow: {
        'paper': '0 10px 30px rgba(10, 10, 10, 0.06)',
        'paper-hover': '0 14px 40px rgba(10, 10, 10, 0.12)',
        'shard': '0 8px 24px rgba(30, 27, 24, 0.08)',
        'ink': '0 4px 16px rgba(30, 27, 24, 0.15)',
      },
      backdropBlur: {
        'paper': '6px',
      },
      transitionTimingFunction: {
        'organic': 'var(--ease-organic)',
      },
      transitionDuration: {
        'hover': 'var(--duration-hover)',
        'reveal': 'var(--duration-reveal)',
        'long': 'var(--duration-long)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "ink-ripple": {
          '0%': { transform: 'scale(0.4)', opacity: '0.6' },
          '50%': { opacity: '0.3' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        },
        "shard-float": {
          '0%, 100%': { transform: 'translateY(0px) rotate(2deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        "fade-in-up": {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ink-ripple": "ink-ripple 320ms var(--ease-organic)",
        "shard-float": "shard-float 4s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s var(--ease-organic)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
