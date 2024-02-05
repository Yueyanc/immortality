import path from "path"
import tailwindcssAnimate from "tailwindcss-animate"
const root = process.cwd()
export default {
  darkMode: ["class"],
  content: [path.join(root, "./src/**/*.{ts,tsx}")],
  plugins: [tailwindcssAnimate]
}
