const defaultTheme = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                kelp: {
                    primary: "#4B0082", // Dark Indigo
                    accent: {
                        start: "#FF69B4", // Pink
                        end: "#FF8C00", // Orange
                    },
                    action: "#00FFFF", // Cyan Blue
                    bg: {
                        app: "#F8FAFC", // Light Slate
                        slide: "#FFFFFF", // Pure White
                    },
                },
            },
            fontFamily: {
                sans: ["Arial", "Inter", ...defaultTheme.fontFamily.sans],
            },
            backgroundImage: {
                "kelp-gradient": "linear-gradient(to right, #FF69B4, #FF8C00)",
            },
        },
    },
    plugins: [],
}
