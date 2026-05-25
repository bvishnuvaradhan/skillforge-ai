import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LearningRoadmap } from '../components/dashboard/LearningRoadmap';
import { ForecastChart, ConsistencyGraph, DecayVisualization } from '../components/dashboard/VisualAnalytics';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LuArrowLeft } from 'react-icons/lu';

export function LearningJourneyPage({ onBack }) {
  // Mock data - replace with real data from API
  const mockTopics = [
    {
      id: '1',
      name: 'Arrays & Strings',
      category: 'Fundamentals',
      description: 'Core data structure operations',
      mastery: 0.85,
      readiness: 1.0,
      prerequisites: [],
      relatedTopics: ['Binary Search', 'Sorting'],
    },
    {
      id: '2',
      name: 'Binary Search',
      category: 'Fundamentals',
      description: 'Efficient searching in sorted data',
      mastery: 0.7,
      readiness: 1.0,
      prerequisites: ['Arrays & Strings'],
      relatedTopics: ['Two Pointers', 'Recursion'],
    },
    {
      id: '3',
      name: 'Dynamic Programming',
      category: 'Advanced',
      description: 'Optimization through memoization',
      mastery: 0.45,
      readiness: 0.8,
      recommended: true,
      prerequisites: ['Recursion'],
      relatedTopics: ['Greedy', 'Backtracking'],
    },
    {
      id: '4',
      name: 'Graphs & Trees',
      category: 'Advanced',
      description: 'Network and hierarchical data structures',
      mastery: 0.55,
      readiness: 0.9,
      prerequisites: ['BFS/DFS'],
      relatedTopics: ['Dynamic Programming'],
    },
  ];

  const recommendedPath = ['3', '4'];

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
        <h1 className="text-4xl font-bold mb-2">Your Learning Journey</h1>
        <p className="text-sm opacity-60">Map your skill progression and optimize your learning path</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmap - takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <LearningRoadmap
            topics={mockTopics}
            recommendedPath={recommendedPath}
          />
        </div>

        {/* Side Panel - Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
            <p className="text-xs opacity-50 uppercase tracking-wider mb-2">Journey Stats</p>
            <div className="space-y-3">
              <div>
                <p className="text-sm opacity-70">Topics Mastered</p>
                <p className="text-3xl font-bold text-emerald-400">2</p>
              </div>
              <div>
                <p className="text-sm opacity-70">In Progress</p>
                <p className="text-3xl font-bold text-cyan-400">2</p>
              </div>
              <div>
                <p className="text-sm opacity-70">To Explore</p>
                <p className="text-3xl font-bold text-purple-400">5</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <p className="text-xs opacity-50 uppercase tracking-wider mb-3">Recommended Next</p>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold">Dynamic Programming</p>
                <p className="text-xs opacity-60 mt-1">Ready in 3-5 days</p>
              </div>
              <Button variant="secondary" className="w-full text-xs">
                Start Learning
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Visual Analytics Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Growth Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ForecastChart title="Mastery Forecast" timeframe="30 days" />
          <ConsistencyGraph title="Weekly Activity" />
        </div>
      </div>

      {/* Decay Analysis */}
      <DecayVisualization topics={mockTopics} />
    </motion.section>
  );
}

export default LearningJourneyPage;
