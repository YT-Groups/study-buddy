
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface HeaderProps {
  username?: string;
}

export function Header({ username }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-lg border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-medium">Study Buddy</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-peach rounded-full"></span>
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
        
        {username && (
          <span className="text-sm font-medium hidden md:inline-block">
            {username}
          </span>
        )}
      </div>
    </header>
  );
}
