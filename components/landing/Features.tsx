'use client';

import { motion } from 'framer-motion';
import { FEATURES } from './data';
import { useTheme } from '@/components/ThemeProvider';
import { SpotlightCard } from './SpotlightCard';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Features() {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <section id="features" className={`border-t py-20 ${
      isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'
    }`}>
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center"
        >
          <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Everything you need for payroll
          </h2>
          <p className={`mt-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            A complete platform to manage your business payroll with confidence.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <SpotlightCard key={feature.title}>
                <motion.article
                  variants={item}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`group relative flex h-full flex-col rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${
                    isDark
                      ? 'border-slate-700 bg-slate-900 hover:border-slate-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`relative z-20 flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`relative z-20 mt-4 text-base font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{feature.title}</h3>
                  <p className={`relative z-20 mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{feature.description}</p>
                </motion.article>
              </SpotlightCard>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}