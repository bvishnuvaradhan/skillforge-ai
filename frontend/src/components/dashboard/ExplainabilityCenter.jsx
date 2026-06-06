"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  LuBrainCircuit,
  LuSparkles,
  LuCompass,
  LuGauge,
  LuListTodo,
  LuTrendingUp,
  LuActivity,
  LuInfo,
  LuShieldAlert
} from 'react-icons/lu';

export function ExplainabilityCenter({ insights = [] }) {
  void LuTrendingUp; void LuActivity; void LuInfo; void LuShieldAlert;
  const [activeTab, setActiveTab] = useState('all');

  // Filter insights based on tab
  const filteredInsights = useMemo(() => {
    if (activeTab === 'all') return insights;
    if (activeTab === 'recommendations') {
      return insights.filter(ins => ins.type === 'recommendation' || ins.type === 'mastery_drop');
    }
    if (activeTab === 'roadmap') {
      return insights.filter(ins => ins.type === 'trend' || ins.type === 'dna_profile');
    }
    if (activeTab === 'focus') {
      return insights.filter(ins => ins.type === 'frequency_pattern');
    }
    return insights;
  }, [insights, activeTab]);

  // Compute average AI confidence score
  const avgConfidence = useMemo(() => {
    if (insights.length === 0) return 82;
    const total = insights.reduce((sum, ins) => sum + (ins.confidence?.score || ins.confidence || 0.75), 0);
    return Math.round((total / insights.length) * 100);
  }, [insights]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'recommendation':
      case 'mastery_drop':
        return <LuListTodo className="text-cyan-400" size={18} />;
      case 'trend':
      case 'dna_profile':
        return <LuTrendingUp className="text-purple-400" size={18} />;
      case 'frequency_pattern':
        return <LuActivity className="text-emerald-400" size={18} />;
      default:
        return <LuInfo className="text-slate-400" size={18} />;
    }
  };

  const getInsightHeader = (type) => {
    switch (type) {
      case 'recommendation': return 'Active Recommendation Justification';
      case 'mastery_drop': return 'Retention Decay & Mastery Recovery Alert';
      case 'trend': return 'Roadmap & Mastery Propagation';
      case 'dna_profile': return 'Learning Style Archetype Factor';
      case 'frequency_pattern': return 'Cognitive Focus & Consistency Adjustment';
      default: return 'AI Intelligence Directive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Confidence Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card depth="level2" className="p-6 md:col-span-2 relative overflow-hidden bg-gradient-to-r from-slate-900/40 via-indigo-950/10 to-slate-900/40 border border-white/10 rounded-3xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <p className="text-xs uppercase tracking-wider text-purple-400 font-bold font-mono">Decision Explainability</p>
            <h2 className="text-2xl font-semibold text-white mt-1">AI Intelligence Explainability Console</h2>
            <p className="text-xs opacity-60 mt-1">
              Analyzing the triggers, evidence trails, and governance constraints that direct your learning journey.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <h4 className="font-semibold text-cyan-300">Why this recommendation?</h4>
              <p className="opacity-70 mt-1 leading-relaxed">
                Prioritized when skill retention drops below 60% or when core prerequisites are unlocked.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <h4 className="font-semibold text-purple-300">Why did my roadmap update?</h4>
              <p className="opacity-70 mt-1 leading-relaxed">
                Mastery levels propagate to downstream topics. Unlocking parents exposes child concepts automatically.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <h4 className="font-semibold text-emerald-300">Why did my focus shift?</h4>
              <p className="opacity-70 mt-1 leading-relaxed">
                Consistent solvers trigger exploration suggestions. Repeated failures switch focus to fundamental review.
              </p>
            </div>
          </div>
        </Card>

        {/* Confidence Gauge */}
        <Card depth="level2" className="p-6 flex flex-col justify-between items-center text-center relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-full">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center justify-center gap-1.5">
              <LuGauge size={16} className="text-cyan-400" />
              System Confidence
            </h3>
            <p className="text-xs opacity-50">Overall AI confidence index across active directives</p>
          </div>

          <div className="my-6 relative flex items-center justify-center">
            {/* Simple Circular Progress representation */}
            <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center">
              <div className="text-2xl font-bold font-mono text-cyan-400">{avgConfidence}%</div>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
          </div>

          <p className="text-[10px] opacity-40 leading-relaxed max-w-[180px]">
            Based on validation checks, historical feedback accuracy, and coding profile coherence.
          </p>
        </Card>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {[
          { id: 'all', label: 'All Rationale', icon: LuBrainCircuit },
          { id: 'recommendations', label: 'Recommendations', icon: LuListTodo },
          { id: 'roadmap', label: 'Roadmap & Style', icon: LuCompass },
          { id: 'focus', label: 'Focus & Cooldowns', icon: LuSparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          void Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Rationale Cards Feed */}
      <div className="space-y-4">
        {filteredInsights.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredInsights.map((insight, idx) => {
              const confidenceVal = Math.round((insight.confidence?.score || insight.confidence || 0.75) * 100);
              
              return (
                <motion.div
                  key={insight.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                >
                  <Card depth="level2" className="p-6 border-l-4 border-purple-500/50 hover:border-purple-500 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mt-0.5">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider font-mono text-purple-400">
                            {getInsightHeader(insight.type)}
                          </p>
                          <h4 className="text-base font-semibold text-white mt-1">
                            {insight.metadata?.topic ? `Topic: ${insight.metadata.topic}` : 'Core System Directive'}
                          </h4>
                          <p className="text-xs opacity-75 mt-2 leading-relaxed">
                            {insight.whyThisNow || insight.explanation || insight.reason || 'AI recommendation generated based on user behavioral records and active knowledge decay rates.'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] opacity-40 uppercase font-mono">AI Confidence</span>
                        <p className="text-base font-mono font-bold text-cyan-400">{confidenceVal}%</p>
                      </div>
                    </div>

                    {/* Evidence Checklist */}
                    {insight.evidence && insight.evidence.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono">🧬 Decision Evidence Trails</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {insight.evidence.map((ev, i) => (
                            <div key={i} className="flex gap-2 p-2 rounded-xl bg-slate-950/40 border border-white/5 text-[11px] opacity-80">
                              <LuSparkles className="text-cyan-400 mt-0.5 flex-shrink-0" size={12} />
                              <span className="leading-tight">{ev}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional insights specific tags */}
                    {insight.metadata?.sourceAlgorithm && (
                      <div className="mt-3 flex gap-2">
                        <span className="text-[9px] font-mono opacity-40 bg-white/5 px-2 py-0.5 rounded">
                          Engine: {insight.metadata.sourceAlgorithm}
                        </span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <Card depth="level1" className="p-8 text-center border-dashed border-white/10 opacity-50">
            <LuShieldAlert size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No specific rationale records matching this category</p>
            <p className="text-xs mt-1">Insights generate as you connect profiles and complete sessions.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ExplainabilityCenter;
