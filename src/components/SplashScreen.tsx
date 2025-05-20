import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen() {
  const [phase, setPhase] = useState<'initial' | 'split' | 'final' | 'complete'>('initial');

  useEffect(() => {
    const timeline = [
      { phase: 'split', delay: 2000 },
      { phase: 'final', delay: 3000 },
      { phase: 'complete', delay: 5000 }
    ];

    const timeouts = timeline.map(({ phase, delay }) => 
      setTimeout(() => setPhase(phase as any), delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {phase !== 'complete' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {phase === 'initial' && (
              <motion.h1
                key="initial"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl font-light text-black tracking-wider"
              >
                yorke & toni
              </motion.h1>
            )}

            {phase === 'split' && (
              <motion.div
                key="split"
                className="relative flex items-center justify-center gap-32"
              >
                <motion.span
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="text-4xl md:text-6xl font-light text-black tracking-wider"
                >
                  yorke
                </motion.span>
                <motion.span
                  initial={{ x: 0, opacity: 1 }}
                  animate={{ x: 100, opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="text-4xl md:text-6xl font-light text-black tracking-wider"
                >
                  & toni
                </motion.span>
              </motion.div>
            )}

            {phase === 'final' && (
              <motion.div
                key="final"
                className="text-center space-y-6"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-5xl md:text-7xl font-light text-black tracking-[0.2em]"
                >
                  obsession
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="text-lg md:text-xl text-black/60 font-light tracking-[0.3em]"
                >
                  beats talent
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
