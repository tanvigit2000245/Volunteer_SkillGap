import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Target, Users, Lightbulb } from 'lucide-react';

function AnimatedCard({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutSection() {
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true, margin: '-60px' });

  const features = [
    {
      icon: Target,
      title: 'Skill-Based Volunteering',
      description: 'Connect individuals with opportunities that match their abilities.',
      color: 'from-[#0284c7] to-[#0d84d6]',
      bgLight: 'bg-sky-50',
    },
    {
      icon: Users,
      title: 'Community Collaboration',
      description: 'Bring volunteers and organizations together to work towards common goals.',
      color: 'from-[#00b4d8] to-[#14b8a6]',
      bgLight: 'bg-teal-50',
    },
    {
      icon: Lightbulb,
      title: 'Meaningful Impact',
      description: 'Encourage people to contribute their time and knowledge to create positive change.',
      color: 'from-[#145ac7] to-[#0284c7]',
      bgLight: 'bg-indigo-50',
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-xs font-bold uppercase tracking-wider mb-4">
            About Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c2340] tracking-tight mb-6">
            Who We Are
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Volunteer Skill Gap is a platform that bridges the gap between volunteers and 
            organizations by connecting people with meaningful opportunities based on their 
            skills and interests.
          </p>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mt-4">
            We believe everyone has something valuable to contribute. Our platform helps 
            organizations find the right volunteers while giving individuals an opportunity 
            to use their abilities to create positive social change.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <AnimatedCard key={feature.title} delay={index * 0.15}>
              <div className="group relative p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={26} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-[#0c2340] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative gradient line */}
                <div className={`mt-6 h-1 w-12 rounded-full bg-gradient-to-r ${feature.color} group-hover:w-20 transition-all duration-300`} />
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}

