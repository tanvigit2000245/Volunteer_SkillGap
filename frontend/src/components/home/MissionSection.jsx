import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Compass, Eye, ArrowRight } from 'lucide-react';

export default function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="mission" className="py-20 sm:py-28 bg-gradient-to-br from-[#f0f7ff] via-[#e8f4fd] to-[#f4fbfa] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[#0284c7]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full bg-[#00b4d8]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-xs font-bold uppercase tracking-wider mb-4">
            What Drives Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c2340] tracking-tight">
            Our Mission & Vision
          </h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="group relative p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#145ac7] to-[#0d84d6] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Compass size={30} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#0c2340] mb-4">Our Mission</h3>
            <p className="text-base text-slate-600 leading-relaxed mb-6">
              To make volunteering more accessible by connecting individuals with organizations 
              that need their skills and support.
            </p>
            <div className="flex items-center gap-2 text-[#0284c7] font-semibold text-sm group-hover:gap-3 transition-all">
              <span>Learn more</span>
              <ArrowRight size={16} />
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="group relative p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00b4d8] to-[#14b8a6] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Eye size={30} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#0c2340] mb-4">Our Vision</h3>
            <p className="text-base text-slate-600 leading-relaxed mb-6">
              To build a connected community where everyone can contribute their abilities 
              towards meaningful social change.
            </p>
            <div className="flex items-center gap-2 text-[#00b4d8] font-semibold text-sm group-hover:gap-3 transition-all">
              <span>Learn more</span>
              <ArrowRight size={16} />
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {[
            { number: '500+', label: 'Active Volunteers' },
            { number: '120+', label: 'Organizations' },
            { number: '1,000+', label: 'Projects Completed' },
            { number: '50+', label: 'Communities Served' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#0284c7] to-[#00b4d8] bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

