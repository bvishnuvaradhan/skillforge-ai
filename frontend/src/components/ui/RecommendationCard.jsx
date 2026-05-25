import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { LuChevronDown, LuZap, LuGaugeCircle } from 'react-icons/lu';

export function RecommendationCard({ rec = {}, onAccept, onSnooze, onComplete }) {
  const [expanded, setExpanded] = useState(false);

  const title = rec.title || rec.action || 'Practice: Topic';
  const why = rec.whyThisNow || rec.reason || rec.explanation || 'Recommended based on recent decay and dependency readiness.';
  const confidence = Math.round((rec.confidence || rec.conf || 0) * 100);
  const effort = rec.effort || rec.estimatedEffort || '10m';
  const impact = rec.impact || 'High';
  const state = rec.state || 'active';
  const dependencies = rec.dependencies || [];
  const evidence = rec.evidence || [];

  const stateColor = {
    active: 'border-cyan-500/50',
    reinforcing: 'border-purple-500/50',
    exploring: 'border-pink-500/50',
    critical: 'border-amber-500/50',
    deferred: 'border-slate-500/30'
  }[state] || 'border-cyan-500/50';

  const stateLabel = {
    active: 'Priority',
    reinforcing: 'Reinforcing',
    exploring: 'Exploration',
    critical: 'Critical',
    deferred: 'Deferred'
  }[state] || 'Active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className={`min-w-[340px] border-l-4 hover:shadow-lg transition-all ${stateColor}`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  state === 'critical' ? 'bg-amber-500/20 text-amber-300' :
                  state === 'reinforcing' ? 'bg-purple-500/20 text-purple-300' :
                  state === 'exploring' ? 'bg-pink-500/20 text-pink-300' :
                  'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {stateLabel}
                </span>
              </div>
              <h5 className="text-sm font-semibold text-white">{title}</h5>
              <p className="text-xs mt-2 opacity-60 leading-relaxed">{why}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] opacity-50 mb-1">Confidence</div>
              <div className="flex items-center gap-1">
                <GaugeIcon value={confidence} />
                <span className="text-lg font-bold text-cyan-400">{confidence}%</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div className="bg-white/5 rounded p-2">
              <p className="opacity-50">Effort</p>
              <p className="font-medium mt-1">{effort}</p>
            </div>
            <div className="bg-white/5 rounded p-2">
              <p className="opacity-50">Impact</p>
              <p className="font-medium mt-1">{impact}</p>
            </div>
            <div className="bg-white/5 rounded p-2">
              <p className="opacity-50">Urgency</p>
              <p className="font-medium mt-1">{rec.urgency || 'Medium'}</p>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <Button variant="primary" onClick={onAccept} className="flex-1 text-xs">Start</Button>
            <Button variant="secondary" onClick={onSnooze} className="flex-1 text-xs">Snooze</Button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpanded(!expanded)}
              className="p-2 rounded hover:bg-white/10 transition-colors"
              aria-label="Expand details"
            >
              <LuChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} size={16} />
            </motion.button>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-xs">
                  {evidence.length > 0 && (
                    <div>
                      <p className="opacity-50 uppercase tracking-wider mb-2">Evidence</p>
                      <ul className="space-y-1 opacity-70">
                        {evidence.slice(0, 3).map((e, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-cyan-400">•</span>
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dependencies.length > 0 && (
                    <div>
                      <p className="opacity-50 uppercase tracking-wider mb-2">Dependencies</p>
                      <div className="flex flex-wrap gap-1">
                        {dependencies.map((d, i) => (
                          <span key={i} className="bg-white/10 px-2 py-1 rounded text-[10px] opacity-70">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    onClick={onComplete}
                    className="w-full text-xs mt-2"
                  >
                    Mark Complete
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

function GaugeIcon({ value }) {
  const hue = (value / 100) * 120;
  return (
    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
         style={{ borderColor: `hsl(${hue}, 100%, 50%)`, color: `hsl(${hue}, 100%, 50%)` }}>
      {Math.round(value / 20)}
    </div>
  );
}

export default RecommendationCard;
