import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '../ui/StatCard';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export function StatCardCarousel({ stats = [] }) {
  const [current, setCurrent] = useState(0);

  if (!stats.length) return null;

  const handleNext = () => setCurrent((current + 1) % stats.length);
  const handlePrev = () => setCurrent((current - 1 + stats.length) % stats.length);

  return (
    <div className="space-y-3">
      {/* Desktop: Grid Layout (hidden on mobile via CSS) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Mobile: Carousel (visible on mobile only) */}
      <div className="md:hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Current Card */}
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <StatCard {...stats[current]} />
          </motion.div>

          {/* Carousel Controls */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={handlePrev}
              className="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
              aria-label="Previous metric"
            >
              <LuChevronLeft size={16} />
            </button>

            {/* Indicator Dots */}
            <div className="flex gap-1 justify-center flex-1">
              {stats.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? 'bg-cyan-400 w-6' : 'bg-white/30 w-2'
                  }`}
                  aria-label={`Go to metric ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
              aria-label="Next metric"
            >
              <LuChevronRight size={16} />
            </button>
          </div>

          {/* Counter */}
          <p className="text-xs opacity-50 text-center mt-2">
            {current + 1} of {stats.length}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default StatCardCarousel;
