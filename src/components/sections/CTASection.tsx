import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BackgroundSlideshow } from '@/components/ui/BackgroundSlideshow';

const ctaImages = [
  '/hero/college2.jpg',
  '/hero/unsplash2.jpg',
  '/hero/college1.jpg',
  '/hero/unsplash1.jpg'
];

export function CTASection() {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center">
      <BackgroundSlideshow images={ctaImages} interval={8000} />
      
      <div className="relative z-20 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mix-blend-difference"
        >
          <h2 className="text-6xl lg:text-7xl font-light tracking-tight text-white mb-8">
            Ready to Transform Your{' '}
            <span className="text-white block mt-2">
              Learning Journey
            </span>
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed font-light tracking-wide">
            Join thousands of students who are already using StudyBuddy to achieve their academic goals.
          </p>
          <div className="space-y-6">
            <Link to="/register">
              <Button 
                size="lg"
                className="bg-transparent hover:bg-white/10 text-white border border-white/20 font-light px-10 py-6 rounded-full
                  transition-all duration-300"
              >
                Start Free
              </Button>
            </Link>
            <p className="text-white/70 text-base font-light tracking-wide">No credit card required • Free forever</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
