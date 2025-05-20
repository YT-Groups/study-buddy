import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 mix-blend-difference`}
    >
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <motion.h1 
          className="text-2xl font-light tracking-wide text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          yorke & toni
        </motion.h1>
        <Link to="/login">
          <Button 
            variant="link" 
            className="text-white hover:text-white/90 transition-colors text-base font-light tracking-wider p-0"
          >
            login
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
}
