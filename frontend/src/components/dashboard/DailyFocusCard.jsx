import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LuArrowRight, LuLock } from 'react-icons/lu';

export function DailyFocusCard({ recommendations = [], onStart, onViewMore }) {
  if (recommendations.length === 0) {
    return (
      <Card className="p-8 border-dashed border-white/20">
        <div className="text-center opacity-50">
          <p className="text-sm mb-3">No recommendations yet</p>
          <p className="text-xs">Complete problems to generate personalized recommendations</p>
        </div>
      </Card>
    );
  }

  const topRec = recommendations[0];
  const remaining = recommendations.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Card className="p-6 border-l-4 border-cyan-500/50 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top recommendation */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">Top Priority</p>
                <h3 className="text-lg font-semibold text-white">{topRec.title || 'Practice: Topic'}</h3>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs opacity-50 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {Math.round((topRec.confidence || 0) * 100)}%
                </p>
              </div>
            </div>

            <p className="text-sm opacity-70 mb-4 leading-relaxed">
              {topRec.whyThisNow || topRec.explanation || 'Recommended based on your learning profile and recent activity.'}
            </p>

            <div className="flex gap-3">
              <Button variant="primary" onClick={() => onStart?.(topRec)} className="flex-1 text-sm">
                Start Now
              </Button>
              <Button variant="secondary" className="text-sm" onClick={onViewMore}>
                View Details <LuArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* Additional recommendations preview */}
          {remaining > 0 && (
            <div className="pt-6 border-t border-white/10">
              <p className="text-xs opacity-50 uppercase tracking-wider mb-3">
                +{remaining} more {remaining === 1 ? 'recommendation' : 'recommendations'}
              </p>
              <div className="space-y-2">
                {recommendations.slice(1, 3).map((rec, i) => (
                  <div key={i} className="flex items-start justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <span className="text-xs font-medium">{rec.title || 'Practice: Topic'}</span>
                    <span className="text-xs opacity-50">{Math.round((rec.confidence || 0) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
