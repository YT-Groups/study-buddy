import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const { setUser } = useUser();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      name,
      email,
      username,
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
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white text-black relative flex items-center justify-center">
      <div className="w-full max-w-md p-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wide mb-2">
            create account
          </h1>
          <p className="text-black/60 text-sm font-light">
            join studybuddy today
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-light text-black/70">
              full name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 border-black/10 bg-transparent hover:border-black/20 focus:border-black/30 font-light rounded-lg"
                placeholder="john doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-light text-black/70">
              username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 border-black/10 bg-transparent hover:border-black/20 focus:border-black/30 font-light rounded-lg"
                placeholder="johndoe"
                required
              />
            </div>
          </div>

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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 border-black/10 bg-transparent hover:border-black/20 focus:border-black/30 font-light rounded-lg"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-black hover:bg-black/90 text-white font-light px-8 py-6 rounded-full transition-all duration-300 tracking-wide"
            >
              create account
            </Button>
          </div>
        </form>

        <p className="mt-12 text-center text-sm text-black/60 font-light tracking-wide">
          Already have an account?{' '}
          <Link to="/login" className="text-black hover:text-black/70 underline-offset-4 hover:underline">
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
}