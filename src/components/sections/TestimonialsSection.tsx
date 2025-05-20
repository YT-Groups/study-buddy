import { motion } from 'framer-motion';
import { BackgroundSlideshow } from '@/components/ui/BackgroundSlideshow';

const testimonialImages = [
  '/hero/college6.jpg',
  '/hero/college5.jpg',
  '/hero/coffee2.jpg',
  '/hero/unsplash3.jpg'
];

const testimonials = [
  {
    quote: "The AI quiz generation is genuinely amazing! This website is one of one.",
    author: "Kenrich Nettey",
    role: "Medical Student"
  },
  {
    quote: "We built this website and these algorithms to help students achieve the goals they set for themselves. ",
    author: "Yorke",
    role: "Co-ceo, Yorke & Toni"
  },
  {
    quote: "As a law student the flahscard generation has been of immense help. Words can't describe how greatful i am",
    author: "James L.",
    role: "Law Student,UPSA"
  },
  {
    quote: "The way it turns my PDF notes into interactive quizzes is simply amazing!",
    author: "Emma R.",
    role: "Engineering Student"
  }
];

export function TestimonialsSection() {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center">
      <BackgroundSlideshow images={testimonialImages} interval={7000} />
      
      <motion.div 
        className="relative z-20 container mx-auto px-4 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-light tracking-tight text-center text-white mb-16 mix-blend-difference"
        >
          What Students Say
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="p-8 mix-blend-difference"
            >
              <blockquote className="text-lg text-white mb-4 font-light">"{testimonial.quote}"</blockquote>
              <div className="flex items-center">
                <div>
                  <cite className="text-white/90 font-light block not-italic">{testimonial.author}</cite>
                  <span className="text-white/60 text-sm">{testimonial.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
