/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Rutas de tus archivos
  theme: {
    extend: {
      colors: {
        dark: "rgb(16,51,51)", 
        light: "rgb(241,251,251)", 
        green:"rgb(171,236,222)",
        background: "rgba(244,254,255,255"
      },
    },
  },
  plugins: [],
};


