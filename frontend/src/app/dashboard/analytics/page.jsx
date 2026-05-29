"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ForecastChart, ConsistencyGraph, DecayVisualization } from '../../../components/dashboard/VisualAnalytics';
import { SkillDNAExperience } from '../../../components/dashboard/SkillDNAExperience';
import { RetentionHeatmap } from '../../../components/dashboard/RetentionHeatmap';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LuDownload, LuShare2, LuArrowLeft } from 'react-icons/lu';
import { useRouter } from 'next/navigation';

// preserve imports for lint pass
void motion;
void ForecastChart;
void ConsistencyGraph;
void DecayVisualization;
void SkillDNAExperience;
void RetentionHeatmap;
void Card;
void Button;
void LuArrowLeft;

function AnalyticsPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('30d');

  // Mock data
  const mockTopics = [
    { topic: 'Dynamic Programming', mastery: 0.65, retentionScore: 0.7, daysSinceSolved: 2 },
    { topic: 'Graphs', mastery: 0.72, retentionScore: 0.75, daysSinceSolved: 1 },
    { topic: 'Arrays', mastery: 0.88, retentionScore: 0.92, daysSinceSolved: 0 },
    { topic: 'Recursion', mastery: 0.55, retentionScore: 0.45, daysSinceSolved: 7 },
    { topic: 'Binary Search', mastery: 0.78, retentionScore: 0.82, daysSinceSolved: 3 },
    { topic: 'Strings', mastery: 0.81, retentionScore: 0.88, daysSinceSolved: 1 },
  ];

  const mockDNA = {
    type: 'Deep Diver',
    confidence: 0.82,
    description: 'You master topics through deep, focused exploration of complex problems.',
    retryBehavior: 0.75,
    explorationBehavior: 0.45,
    difficultyPreference: 0.85,
    focusStyle: 'concentrated',
    learningRhythm: 'consistent',
    insights: [
      'You spend 2-3x longer on complex problems than average',
      'Your mastery depth is higher than breadth',
      'You benefit from progressive difficulty increases',
    ],
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-shell space-y-8"
    >
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity mb-4"
        >
          <LuArrowLeft size={16} />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Intelligence Analytics</h1>
            <p className="text-sm opacity-60">Deep dive into your learning patterns and skill evolution</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={LuDownload} className="text-xs">
              Export
            </Button>
            <Button variant="secondary" icon={LuShare2} className="text-xs">
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-6">
        {['7d', '30d', '90d', 'All'].map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`px-4 py-2 rounded text-xs font-medium transition-all ${
              timeframe === period
                ? 'bg-cyan-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Skill DNA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
      >
        <h2 className="text-2xl font-semibold mb-6">Your Learning DNA</h2>
        <Card depth="level2" className="p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl -z-1" />
          <div className="relative z-10">
            <SkillDNAExperience dnaData={mockDNA} />
          </div>
        </Card>
      </motion.div>

      {/* Forecast & Consistency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-6">Growth Trajectory</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card depth="level2" className="p-6">
            <ForecastChart title="Mastery Forecast" timeframe={`${timeframe} forecast`} />
          </Card>
          <Card depth="level2" className="p-6">
            <ConsistencyGraph title="Learning Consistency" />
          </Card>
        </div>
      </motion.div>

      {/* Retention & Decay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-6">Skill Health</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card depth="level2" className="p-6">
            <RetentionHeatmap topicStats={mockTopics} />
          </Card>
          <Card depth="level2" className="p-6">
            <DecayVisualization topics={mockTopics} />
          </Card>
        </div>
      </motion.div>

      {/* Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.4 }}
      >
        <Card depth="level2" className="p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-400 opacity-10 rounded-full blur-3xl -z-1" />
          <h3 className="text-lg font-semibold mb-4 relative z-10">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              <InsightBox title="Learning Velocity" value="2.3%" subtitle="problems/day increase" />
              <InsightBox title="Retention Health" value="78%" subtitle="average mastery retention" />
              <InsightBox title="Consistency Score" value="92%" subtitle="7-day streak maintained" />
            </div>
        </Card>
      </motion.div>
    </motion.section>
  );
}

function InsightBox({ title, value, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-4 rounded-lg bg-white/5 border border-white/10"
    >
      <p className="text-xs opacity-50 uppercase tracking-wider mb-2">{title}</p>
      <p className="text-3xl font-bold text-cyan-400 mb-1">{value}</p>
      <p className="text-xs opacity-60">{subtitle}</p>
    </motion.div>
  );
}

// Ensure InsightBox remains referenced for lint rules
void InsightBox;

export default AnalyticsPage;
