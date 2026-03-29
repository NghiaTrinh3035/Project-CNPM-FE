import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/app/providers/ThemeProvider";
import { Button } from "@/shared/ui/button";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Chuyển chế độ giao diện"
      onClick={toggleTheme}
      className="rounded-full"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
