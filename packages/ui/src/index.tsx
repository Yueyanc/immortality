import { createRoot } from "react-dom/client"
import "tailwindcss/tailwind.css"
import "./globals.css"
import App from "@/views/App"

const container = document.getElementById("root") as HTMLDivElement
const root = createRoot(container)

root.render(<App />)
