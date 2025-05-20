import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HeroSlideshow } from '@/components/HeroSlideshow';

export function HeroSection() {
  return (    <section className="relative h-screen overflow-hidden">
      <HeroSlideshow />

      {/* Center Content */}      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <motion.h1 
            className="text-[80px] lg:text-[100px] font-light text-white tracking-tight leading-none font-sans mb-4
              [text-shadow:_0_2px_12px_rgba(0,0,0,0.3)] mix-blend-difference"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            studybuddy
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col items-center gap-4"
          >            <p className="text-lg text-white/80 font-light tracking-wide mb-2">
              transform your learning journey
            </p>
            <Link to="/register">
              <Button size="lg" 
                className="bg-transparent hover:bg-white/10 text-white border border-white/20 font-light px-6 py-3 rounded-full
                  backdrop-blur-sm transition-all duration-300"
              >
                Start Free
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>      {/* Minimal scroll indicator */}
      <motion.div 
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ 
          duration: 2,
          delay: 2,
        }}
      >
        <div className="w-[1px] h-8 bg-white/30" />
      </motion.div>
    </section>
  );
}
