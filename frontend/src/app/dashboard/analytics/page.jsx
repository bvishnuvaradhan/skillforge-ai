import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ForecastChart, ConsistencyGraph, DecayVisualization } from '../components/dashboard/VisualAnalytics';
import { SkillDNAExperience } from '../components/dashboard/SkillDNAExperience';
import { RetentionHeatmap } from '../components/dashboard/RetentionHeatmap';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LuDownload, LuShare2, LuArrowLeft } from 'react-icons/lu';

export function AnalyticsPage({ onBack }) {
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
          onClick={onBack}
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
      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Learning DNA</h2>
        <SkillDNAExperience dnaData={mockDNA} />
      </div>

      {/* Forecast & Consistency */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Growth Trajectory</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ForecastChart title="Mastery Forecast" timeframe={`${timeframe} forecast`} />
          <ConsistencyGraph title="Learning Consistency" />
        </div>
      </div>

      {/* Retention & Decay */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Skill Health</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RetentionHeatmap topicStats={mockTopics} />
          <DecayVisualization topics={mockTopics} />
        </div>
      </div>

      {/* Insights Summary */}
      <Card className="p-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InsightBox title="Learning Velocity" value="2.3%" subtitle="problems/day increase" />
          <InsightBox title="Retention Health" value="78%" subtitle="average mastery retention" />
          <InsightBox title="Consistency Score" value="92%" subtitle="7-day streak maintained" />
        </div>
      </Card>
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

export default AnalyticsPage;
