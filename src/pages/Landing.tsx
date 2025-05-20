import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, BookOpen, Users, Brain, Calendar, Bell, ChartBar } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplashScreen } from "@/components/SplashScreen";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CTASection } from "@/components/sections/CTASection";

export default function Landing() {
  return (
    <>
      <SplashScreen />
      <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white">
        {/* Navigation */}
        <Navbar />

        {/* Hero Section */}
        <div className="snap-start">
          <HeroSection />
        </div>

        {/* Features Section */}
        <section className="snap-start min-h-screen py-20 relative">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="container mx-auto px-4"
          >
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Everything you need to <span className="text-peach">ace your studies</span>
              </h2>
              <p className="text-white/60 text-lg">
                Powerful tools that adapt to your learning style
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-peach/30 transition-all duration-300"
                >
                  <div className="flex flex-col items-start">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="p-3 rounded-xl bg-peach/10 text-peach mb-6 group-hover:bg-peach/20 transition-colors"
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-peach transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/60">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Testimonials Section */}
        <div className="snap-start">
          <TestimonialsSection />
        </div>

        {/* Final CTA */}
        <div className="snap-start">
          <CTASection />
        </div>
      </div>
    </>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "PDF-to-Quiz Converter",
    description: "Drop your notes. Get instant quizzes and flashcards."
  },
  {
    icon: Calendar,
    title: "Smart Timetable Calendar",
    description: "Plan, move, and track your study sessions like a pro."
  },
  {
    icon: Brain,
    title: "Quiz Engine (Offline)",
    description: "Adaptive questions built from your notes — no internet needed."
  },
  {
    icon: Bell,
    title: "Study Alerts",
    description: "Get friendly reminders when it's time to grind."
  },
  {
    icon: ChartBar,
    title: "Track Progress",
    description: "Stay on top of what you've done, and what needs more focus."
  },
  {
    icon: Users,
    title: "Study with Friends",
    description: "Share notes, quizzes, and flashcaards with your friends."
  }
];

const proofPoints = [
  {
    title: "Built by students",
    description: "We know what you need. We built it for you."
  },
  {
    title: "Works offline",
    description: "Don't lose a brain cell to Telecel."
  },
  {
    title: "Always free",
    description: " Money? We don't have some either lol."
  }
];