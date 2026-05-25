import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DependencyGraphExplorer } from '../components/dashboard/DependencyGraphExplorer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LuArrowLeft, LuDownload, LuInfo } from 'react-icons/lu';

export function DependencyGraphPage({ onBack }) {
  const [selectedTopic, setSelectedTopic] = useState(null);

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Skill Dependency Graph</h1>
            <p className="text-sm opacity-60">Explore how topics connect and build on each other</p>
          </div>
          <Button variant="secondary" icon={LuDownload} className="text-xs">
            Export
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <Card depth="level1" className="p-4 bg-cyan-500/10 border border-cyan-500/30 flex gap-3">
          <LuInfo size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm opacity-80">
            <p className="font-semibold mb-1">How to explore:</p>
            <p>Click on any topic node to see prerequisites and related skills. Lines show dependencies between topics. Dashed rings indicate recommended topics for you.</p>
          </div>
        </Card>
      </motion.div>

      {/* Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
      >
        <DependencyGraphExplorer onSelectTopic={setSelectedTopic} />
      </motion.div>

      {/* Learning Path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card depth="level2" className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl -z-1" />
          <h3 className="text-lg font-semibold mb-4 relative z-10">Recommended Learning Path</h3>
          <div className="space-y-3 relative z-10">
            {[
              { order: 1, topic: 'Arrays & Strings', status: 'mastered' },
              { order: 2, topic: 'Binary Search', status: 'developing', note: '75% mastered' },
              { order: 3, topic: 'Recursion', status: 'developing', note: 'Start next' },
              { order: 4, topic: 'Dynamic Programming', status: 'locked', note: 'After recursion' },
            ].map((item) => (
              <motion.div
                key={item.topic}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className={`flex items-center gap-3 p-3 rounded ${
                  item.status === 'mastered' ? 'bg-emerald-500/20' :
                  item.status === 'developing' ? 'bg-cyan-500/20' :
                  'bg-white/5'
                }`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/20">
                  {item.order}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.topic}</p>
                  {item.note && <p className="text-xs opacity-50 mt-0.5">{item.note}</p>}
                </div>
                <span className="text-xs px-2 py-1 rounded bg-white/10">
                  {item.status === 'mastered' ? '✓' : item.status === 'developing' ? '→' : '🔒'}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card depth="level2" className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl -z-1" />
          <h3 className="text-lg font-semibold mb-4 relative z-10">Weak Foundation Areas</h3>
          <div className="space-y-3 relative z-10">
            {[
              { topic: 'Recursion', mastery: 0.65, impact: 'High - blocks DP & backtracking' },
              { topic: 'String Algorithms', mastery: 0.55, impact: 'Medium - interview prep' },
              { topic: 'Bit Manipulation', mastery: 0.35, impact: 'High - interview common' },
            ].map((item) => (
              <motion.div
                key={item.topic}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="p-3 rounded bg-white/5 border border-white/10"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-medium text-sm">{item.topic}</p>
                  <span className="text-xs opacity-70">{Math.round(item.mastery * 100)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-amber-400"
                    style={{ width: `${item.mastery * 100}%` }}
                  />
                </div>
                <p className="text-xs opacity-50">{item.impact}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
      >
        <Card depth="level2" className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400 to-cyan-400 opacity-10 rounded-full blur-3xl -z-1" />
          <h3 className="text-lg font-semibold mb-4 relative z-10">Your Graph Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            <StatBox label="Total Topics" value="47" />
            <StatBox label="Mastered" value="8" color="emerald" />
            <StatBox label="In Progress" value="12" color="cyan" />
            <StatBox label="Locked" value="27" color="slate" />
          </div>
        </Card>
      </motion.div>
    </motion.section>
  );
}

function StatBox({ label, value, color = 'cyan' }) {
  const colors = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    slate: 'text-slate-400',
  };

  return (
    <div className="text-center">
      <p className="text-xs opacity-50 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

export default DependencyGraphPage;
