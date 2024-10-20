import { createRoot } from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import App from "./App";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";
createRoot(document.getElementById("root")).render(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
        <Toaster
            position="bottom-right"
            reverseOrder={true}
        />
    </ThemeProvider>
);

