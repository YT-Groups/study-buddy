import { Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface WelcomeSectionProps {
  username: string;
  avatar?: string | null;
  currentClass?: {
    name: string;
    time: string;
    timeRemaining: string;
  };
}

export function WelcomeSection({ username, avatar, currentClass }: WelcomeSectionProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatar || ""} />
          <AvatarFallback className="text-xl bg-peach-light">
            {username.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {greeting()}, {username}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your studies today</p>
        </div>
      </div>
      
      {currentClass ? (
        <div className="frosted-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">CURRENT CLASS</p>
            <h2 className="text-xl font-semibold">{currentClass.name}</h2>
            <p className="text-muted-foreground">{currentClass.time}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-peach-light/50 px-3 py-1.5 rounded-full">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{currentClass.timeRemaining} remaining</span>
          </div>
        </div>
      ) : (
        <div className="frosted-card p-5">
          <h2 className="text-xl font-semibold">No classes currently scheduled</h2>
          <p className="text-muted-foreground">
            Use this time to review your flashcards or take a quiz!
          </p>
        </div>
      )}
    </section>
  );
}
