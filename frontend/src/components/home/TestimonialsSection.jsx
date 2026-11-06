import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, User } from 'lucide-react';

const testimonials = [
  {
    name: 'Sample Reviewer',
    role: 'Volunteer',
    text: 'Being able to contribute my skills to meaningful community initiatives has been a rewarding experience.',
    rating: 5,
  },
  {
    name: 'Sample Reviewer',
    role: 'Organization Representative',
    text: 'Finding volunteers with the right skills has become easier and more organized.',
    rating: 5,
  },
  {
    name: 'Sample Reviewer',
    role: 'Volunteer',
    text: 'Volunteer Skill Gap encourages people to use their knowledge to make a positive difference.',
    rating: 4,
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={15}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => setCurrentIndex(index);
  const prev = () => setCurrentIndex((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrentIndex((c) => (c + 1) % testimonials.length);

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-xs font-bold uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c2340] tracking-tight">
            What People Say About Us
          </h2>
          <p className="mt-4 text-sm text-slate-500 italic">
            Note: These are sample/demo testimonials for demonstration purposes.
          </p>
        </motion.div>

        {/* Desktop Cards */}
        <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group p-7 rounded-3xl bg-gradient-to-br from-white to-[#f8fbff] border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
            >
              <Quote size={32} className="text-[#0284c7]/10 absolute top-6 right-6" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0284c7] to-[#00b4d8] flex items-center justify-center text-white shadow-md">
                  <User size={22} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0c2340]">{t.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{t.role}</div>
                </div>
              </div>
              <StarRating rating={t.rating} />
              <p className="mt-4 text-sm text-slate-600 leading-relaxed italic">
                "{t.text}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden rounded-3xl">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="p-7 bg-gradient-to-br from-white to-[#f8fbff] border border-slate-200/80 shadow-md rounded-3xl relative"
            >
              <Quote size={32} className="text-[#0284c7]/10 absolute top-6 right-6" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0284c7] to-[#00b4d8] flex items-center justify-center text-white shadow-md">
                  <User size={22} />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0c2340]">{testimonials[currentIndex].name}</div>
                  <div className="text-xs text-slate-500 font-medium">{testimonials[currentIndex].role}</div>
                </div>
              </div>
              <StarRating rating={testimonials[currentIndex].rating} />
              <p className="mt-4 text-sm text-slate-600 leading-relaxed italic">
                "{testimonials[currentIndex].text}"
              </p>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={prev} className="p-2 rounded-full bg-slate-100 hover:bg-[#0284c7]/10 text-slate-600 hover:text-[#0284c7] transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'bg-[#0284c7] w-6'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full bg-slate-100 hover:bg-[#0284c7]/10 text-slate-600 hover:text-[#0284c7] transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

