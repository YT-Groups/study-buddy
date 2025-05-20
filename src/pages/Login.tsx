import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUser } = useUser();
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      setUser({
        name: "User Name",
        email: email,
        username: email.split('@')[0],
        joinDate: new Date().toLocaleDateString(),
        stats: {
          totalStudyHours: 0,
          flashcardsMastered: 0,
          quizzesTaken: 0,
          averageScore: 0
        },
        recentActivity: [],
        flashcardDecks: []
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black relative flex items-center justify-center">
      <div className="w-full max-w-md p-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wide mb-2">
            studybuddy
          </h1>
          <p className="text-black/60 text-sm font-light">
            welcome back
          </p>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-light text-black/70">
              email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-black/10 bg-transparent hover:border-black/20 focus:border-black/30 font-light rounded-lg"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-light text-black/70">
              password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 border-black/10 bg-transparent hover:border-black/20 focus:border-black/30 font-light rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-black/90 text-white font-light px-8 py-6 rounded-full transition-all duration-300 tracking-wide"
            >
              {isLoading ? "signing in..." : "sign in"}
            </Button>
          </div>
        </form>

        <p className="mt-12 text-center text-sm text-black/60 font-light tracking-wide">
          Don't have an account?{' '}
          <Link to="/register" className="text-black hover:text-black/70 underline-offset-4 hover:underline">
            sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
