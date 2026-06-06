"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  LuBrain,
  LuCalendar,
  LuCircleHelp,
  LuInfo,
  LuTrendingDown,
  LuZap,
  LuCircleCheck,
  LuBookOpen
} from 'react-icons/lu';

// Defensive unused variables references
void LuZap;
void motion; void AnimatePresence; void Card; void Button;
void LineChart; void Line; void XAxis; void YAxis; void CartesianGrid; void Tooltip; void ResponsiveContainer;
void LuBrain; void LuCalendar; void LuCircleHelp; void LuInfo; void LuTrendingDown; void LuCircleCheck; void LuBookOpen;

export function MemoryLab({ topicStats = [], decayLogs = [] }) {
  void decayLogs;
  const [showFormula, setShowFormula] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(topicStats[0]?.id || null);

  const activeTopic = topicStats.find(t => t.id === selectedTopicId) || topicStats[0];

  // Calculate overall memory health
  const memoryHealth = useMemo(() => {
    if (topicStats.length === 0) return 84;
    const total = topicStats.reduce((sum, t) => sum + (t.retentionScore || 0), 0);
    return Math.round((total / topicStats.length) * 100);
  }, [topicStats]);

  // Generate data for Forgetting Curve Chart
  const forgettingCurveData = useMemo(() => {
    // R = e^(-t/S)
    // t goes from 0 to 30 days
    // S represents stability. Let's use activeTopic stability or a default (e.g., 10 days)
    const stability = activeTopic ? (activeTopic.stabilityScore || 12) : 12;
    const data = [];
    for (let t = 0; t <= 30; t++) {
      const retention = Math.exp(-t / stability);
      data.push({
        day: `Day ${t}`,
        retention: Math.round(retention * 100),
      });
    }
    return data;
  }, [activeTopic]);

  // Generate a Reinforcement Calendar (Mock calendar based on decay logs or topics)
  const calendarDays = useMemo(() => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = new Date().getDay(); // 0 is Sun, 1 is Mon...
    
    return daysOfWeek.map((day, idx) => {
      // Find topics that need review on this day
      const targetOffset = idx - (currentDayIdx === 0 ? 6 : currentDayIdx - 1);
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() + targetOffset);

      // Simple heuristic: assign topics to calendar days
      const dayTopics = topicStats
        .filter((t, tIdx) => (tIdx % 7) === idx && (t.retentionScore || 0) < 0.8)
        .map(t => t.topic);

      return {
        name: day,
        date: dayDate.getDate(),
        isToday: targetOffset === 0,
        topics: dayTopics,
      };
    });
  }, [topicStats]);

  const getHealthLevel = (score) => {
    if (score >= 80) return { label: 'Optimal', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { label: 'Stable', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' };
    if (score >= 40) return { label: 'Decaying', color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' };
    return { label: 'Critical Decay', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' };
  };

  const currentHealth = getHealthLevel(memoryHealth);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card depth="level2" className="p-6 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-cyan-400 font-bold font-mono">Cognitive Analytics</p>
              <h2 className="text-2xl font-semibold text-white mt-1">Memory Preservation Lab</h2>
              <p className="text-xs opacity-60 mt-1">
                Tracking Ebbinghaus retention curves and neural stability indexes to prevent skill decay.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-4">
              <div className="text-right">
                <p className="text-[10px] opacity-45 uppercase tracking-wider font-mono">Memory Health</p>
                <p className={`text-2xl font-bold font-mono ${currentHealth.color}`}>{memoryHealth}%</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentHealth.bg} border ${currentHealth.border}`}>
                <LuBrain className={currentHealth.color} size={20} />
              </div>
            </div>
          </div>

          {/* Actionable Human-Friendly Guides */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80 flex items-start gap-3">
            <LuInfo size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-cyan-300">Preservation Recommendation</p>
              <p className="opacity-75 mt-1">
                {topicStats.some(t => (t.retentionScore || 0) < 0.6)
                  ? `Your retention in ${topicStats.filter(t => (t.retentionScore || 0) < 0.6).map(t => t.topic).join(', ')} has dropped below threshold. Reinforcing these concepts now will reset their decay curves at a higher stability level.`
                  : "All monitored neural pathways are stable. Keep up the consistent practice to expand your knowledge breadth."}
              </p>
            </div>
          </div>
        </Card>

        {/* Collapsible Math Details Card */}
        <Card depth="level2" className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <LuBookOpen size={15} className="text-purple-400" />
              Decay Mechanics
            </h3>
            <p className="text-xs opacity-60 leading-relaxed">
              SkillForge AI applies normalized decay models to predict memory preservation rates based on difficulty, practice consistency, and interval length.
            </p>
          </div>

          <div className="mt-4">
            <Button
              variant="secondary"
              className="w-full text-xs"
              onClick={() => setShowFormula(!showFormula)}
            >
              {showFormula ? 'Hide Technical Details' : 'Show Technical Details'}
            </Button>

            <AnimatePresence>
              {showFormula && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 text-xs font-mono bg-slate-950/60 p-3 rounded-lg border border-white/5"
                >
                  <p className="text-cyan-400 font-bold text-center">R = e^(-t/S)</p>
                  <div className="mt-2 text-[10px] space-y-1 opacity-70">
                    <p><span className="text-purple-400">R</span>: Retention Probability</p>
                    <p><span className="text-purple-400">t</span>: Days since last problem solved</p>
                    <p><span className="text-purple-400">S</span>: Skill Stability Index</p>
                  </div>
                  <p className="text-[10px] opacity-40 mt-3 pt-2 border-t border-white/5 leading-relaxed">
                    Decay logs checked hourly. Stability increases with successive correct submissions and UDI rating difficulty.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* Main Grid: Curve Graph & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forgetting Curve Chart */}
        <Card depth="level2" className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Ebbinghaus Forgetting Curve</h3>
              <p className="text-xs opacity-50 mt-1">Predicted retention probability decay model</p>
            </div>
            
            {/* Topic selector */}
            <select
              className="bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              value={selectedTopicId || ''}
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              {topicStats.map(t => (
                <option key={t.id || t._id} value={t.id || t._id}>
                  {t.topic}
                </option>
              ))}
            </select>
          </div>

          <div className="h-[250px] w-full">
            {activeTopic ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forgettingCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="retention"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={false}
                    name="Retention Probability"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs opacity-40">
                No active topic data to display.
              </div>
            )}
          </div>
          <div className="mt-2 text-center text-[10px] opacity-40">
            Selected concept: <span className="text-cyan-400 font-bold">{activeTopic?.topic || 'N/A'}</span> • Stability coefficient S = {activeTopic?.stabilityScore || 12}
          </div>
        </Card>

        {/* Reinforcement Calendar */}
        <Card depth="level2" className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <LuCalendar size={15} className="text-cyan-400" />
              Reinforcement Calendar
            </h3>
            <p className="text-xs opacity-50 mt-1">Recommended review schedule based on priority</p>
          </div>

          <div className="space-y-3">
            {calendarDays.map((day) => (
              <div
                key={day.name}
                className={`flex gap-3 items-center p-2.5 rounded-xl border transition-all ${
                  day.isToday
                    ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30'
                    : 'bg-white/5 border-white/5 hover:border-white/15'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                  day.isToday ? 'bg-cyan-500 text-white' : 'bg-slate-900/60 text-white/70'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{day.name}</span>
                  <span className="text-sm font-bold font-mono">{day.date}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {day.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {day.topics.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white opacity-80 font-mono truncate">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] opacity-40 italic flex items-center gap-1">
                      <LuCircleCheck size={10} className="text-emerald-400" /> No revision required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Retention Heapmap / Breakdown list */}
      <Card depth="level2" className="p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <LuTrendingDown size={15} className="text-yellow-400" />
          Neural Retention Mapping
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topicStats.map((topic) => {
            const retention = Math.round((topic.retentionScore || 0) * 100);
            const hl = getHealthLevel(retention);

            return (
              <div
                key={topic.id || topic._id}
                className={`p-4 rounded-2xl border ${hl.border} ${hl.bg} hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-white truncate max-w-[120px]">{topic.topic}</h4>
                    <span className={`text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded ${
                      retention >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                      retention >= 60 ? 'bg-cyan-500/20 text-cyan-400' :
                      retention >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {hl.label}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-50 mt-1">
                    Mastery: {Math.round(topic.masteryScore || 0)}%
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-[10px] mb-1 font-mono">
                    <span className="opacity-50">Retention Probability</span>
                    <span className="font-bold">{retention}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950/65 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        retention >= 80 ? 'bg-emerald-400' :
                        retention >= 60 ? 'bg-cyan-400' :
                        retention >= 40 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ width: `${retention}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default MemoryLab;
