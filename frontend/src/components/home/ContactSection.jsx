import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, MapPin, Camera, Send, User, AtSign, MessageSquare, FileText } from 'lucide-react';

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Frontend demo only – no actual submission handler connected
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-gradient-to-br from-[#f0f7ff] via-[#e8f4fd] to-[#f4fbfa] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#0284c7]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0284c7]/10 text-[#0284c7] text-xs font-bold uppercase tracking-wider mb-4">
            Contact
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0c2340] tracking-tight mb-4">
            Get in Touch
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Have questions or want to get involved? We'd love to hear from you. 
            Reach out and let's make a difference together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0d84d6] flex items-center justify-center shrink-0 shadow-md">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0c2340] mb-1">Email</h4>
                  <p className="text-sm text-slate-500">[email placeholder]</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#14b8a6] flex items-center justify-center shrink-0 shadow-md">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0c2340] mb-1">Location</h4>
                  <p className="text-sm text-slate-500">[location placeholder]</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e1306c] to-[#c13584] flex items-center justify-center shrink-0 shadow-md">
                  <Camera size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0c2340] mb-1">Instagram</h4>
                  <p className="text-sm text-slate-500">[Instagram page placeholder]</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-5">
              {submitted && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium animate-slide-up-fade">
                  Thank you for reaching out! (This is a frontend demo – no message was actually sent.)
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-[#eef3f8]/50 focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100/80 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email"
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-[#eef3f8]/50 focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100/80 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Subject"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-[#eef3f8]/50 focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100/80 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message</label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3.5 top-4 text-slate-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={4}
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-[#eef3f8]/50 focus:bg-white focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100/80 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#145ac7] via-[#0d84d6] to-[#00b4d8] hover:from-[#114eb0] hover:to-[#00a2c3] text-white font-bold text-sm shadow-md shadow-sky-600/25 hover:shadow-sky-600/35 transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
              >
                Send Message
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

