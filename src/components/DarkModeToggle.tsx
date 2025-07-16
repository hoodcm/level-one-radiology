
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      className="p-2 border-2 border-border bg-surface-card shadow-[6px_6px_0px_theme(colors.shadow-hard)] hover:shadow-[8px_8px_0px_theme(colors.shadow-hard)] hover:-translate-y-[1px] hover:translate-x-[-1px] transition-all duration-150 ease-out rounded-none"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
    >
      <span className="relative w-full h-full flex items-center justify-center">
        <Sun
          className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-90 scale-0 transition-all duration-100 text-text-primary dark:text-text-primary dark:rotate-0 dark:scale-100"
        />
        <Moon
          className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-text-primary"
        />
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
