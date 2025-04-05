import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		typography: ({ theme }: { theme: (path: string) => string }) => ({
			default: {
				css: {
					"--tw-prose-body": "hsl(var(--foreground) / 0.9)",
					"--tw-prose-headings": "hsl(var(--foreground))",
					"--tw-prose-lead": "hsl(var(--foreground) / 0.8)",
					"--tw-prose-links": "hsl(var(--foreground))",
					"--tw-prose-bold": "hsl(var(--foreground))",
					"--tw-prose-counters": "hsl(var(--foreground) / 0.7)",
					"--tw-prose-bullets": "hsl(var(--foreground) / 0.6)",
					"--tw-prose-hr": "hsl(var(--foreground) / 0.3)",
					"--tw-prose-quotes": "hsl(var(--foreground) / 0.9)",
					"--tw-prose-quote-borders":
						"hsl(var(--foreground) / 0.3)",
					"--tw-prose-captions": "hsl(var(--foreground) / 0.7)",
					"--tw-prose-code": "hsl(var(--foreground))",
					"--tw-prose-pre-code": "hsl(var(--foreground))",
					"--tw-prose-pre-bg": "hsl(var(--background))",
					"--tw-prose-th-borders": "hsl(var(--foreground) / 0.3)",
					"--tw-prose-td-borders": "hsl(var(--foreground) / 0.2)",
				},
			},
		}),
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
