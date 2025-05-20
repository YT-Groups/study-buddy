
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, BookOpen, FileQuestion, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    title: "Timetable",
    icon: Calendar,
    path: "/timetable",
  },
  {
    title: "Flashcards",
    icon: BookOpen,
    path: "/flashcards",
  },
  {
    title: "Quizzes",
    icon: FileQuestion,
    path: "/quizzes",
  },
  {
    title: "Profile",
    icon: User,
    path: "/profile",
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <>
      {/* Mobile menu toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn(
          "fixed top-3 left-4 z-50 md:hidden",
          isOpen ? "text-foreground" : "text-foreground"
        )}
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar backdrop-blur-md border-r border-border/50 flex flex-col transition-transform duration-300 ease-in-out",
        isOpen || !isMobile ? "translate-x-0" : "-translate-x-full",
        isMobile ? "shadow-xl" : "shadow-none"
      )}>
        <div className="p-6">
          <h2 className="text-xl font-semibold">Study Buddy</h2>
          <p className="text-xs text-muted-foreground">Your personal study assistant</p>
        </div>
        
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.title}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                    )}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 mt-auto">
          <p className="text-xs text-muted-foreground text-center">© 2025 Study Buddy</p>
        </div>
      </div>
    </>
  );
}
