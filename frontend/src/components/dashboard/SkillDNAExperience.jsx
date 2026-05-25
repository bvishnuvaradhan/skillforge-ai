import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LuZap, LuTarget, LuTrendingUp, LuCompass } from 'react-icons/lu';

export function SkillDNAExperience({ dnaData = {} }) {
  const {
    type = 'Deep Diver',
    confidence = 0.75,
    description = 'You learn through deep, focused exploration of complex topics.',
    retryBehavior = 0.7,
    explorationBehavior = 0.5,
    difficultyPreference = 0.8,
    focusStyle = 'concentrated',
    learningRhythm = 'consistent',
    insights = [],
  } = dnaData;

  const archetypes = {
    'Deep Diver': {
      icon: LuTarget,
      color: 'cyan',
      description: 'You master topics through deep, sustained focus on complex problems.',
    },
    'Explorer': {
      icon: LuCompass,
      color: 'pink',
      description: 'You learn by exploring diverse topics and connecting concepts.',
    },
    'Strategic Solver': {
      icon: LuZap,
      color: 'purple',
      description: 'You optimize your learning path for maximum efficiency.',
    },
    'Consistency Builder': {
      icon: LuTrendingUp,
      color: 'emerald',
      description: 'You grow through regular, steady practice and reinforcement.',
    },
  };

  const archetype = archetypes[type] || archetypes['Deep Diver'];
  const Icon = archetype.icon;

  const colorMap = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main archetype card */}
      <Card className={`bg-gradient-to-br ${colorMap[archetype.color]} border-2 p-8`}>
        <div className="flex items-start gap-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex-shrink-0"
          >
            <Icon size={48} className={archetype.color === 'cyan' ? 'text-cyan-400' : archetype.color === 'purple' ? 'text-purple-400' : archetype.color === 'pink' ? 'text-pink-400' : 'text-emerald-400'} />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-4xl font-bold mb-2">{type}</h2>
            <p className="text-sm opacity-70 mb-4 max-w-lg leading-relaxed">{description}</p>
            <div className="flex items-center gap-3">
              <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden max-w-xs">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence * 100}%` }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                />
              </div>
              <span className="text-xs font-medium opacity-70">{Math.round(confidence * 100)}% confidence</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Behavioral traits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BehavioralTrait
          label="Retry Behavior"
          value={retryBehavior}
          description="Tendency to solve failed problems multiple times"
          icon="🔄"
        />
        <BehavioralTrait
          label="Exploration"
          value={explorationBehavior}
          description="Breadth of topics attempted"
          icon="🗺️"
        />
        <BehavioralTrait
          label="Difficulty Preference"
          value={difficultyPreference}
          description="Challenge level preference (higher = harder)"
          icon="📈"
        />
        <BehavioralTrait
          label="Focus Style"
          value={focusStyle === 'concentrated' ? 0.8 : focusStyle === 'balanced' ? 0.5 : 0.3}
          description="Work depth (concentrated, balanced, or scattered)"
          icon="🎯"
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="p-6 bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">Your Learning Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 p-3 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-lg flex-shrink-0">💡</span>
                <p className="text-sm opacity-80">{insight}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations based on DNA */}
      <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Optimized Learning Path</h3>
        <div className="space-y-3 text-sm opacity-80 mb-6">
          {type === 'Deep Diver' && (
            <>
              <p>• Focus on mastering one topic at a time before moving forward</p>
              <p>• Allocate more time for complex problems and advanced concepts</p>
              <p>• Consider exploring prerequisite topics for better foundation</p>
            </>
          )}
          {type === 'Explorer' && (
            <>
              <p>• Build strength in core fundamentals before exploring new areas</p>
              <p>• Create learning connections between different topic areas</p>
              <p>• Balance breadth with depth to avoid gaps</p>
            </>
          )}
          {type === 'Strategic Solver' && (
            <>
              <p>• Your optimization-focused approach is excellent for interviews</p>
              <p>• Ensure you don't skip important foundational concepts</p>
              <p>• Occasionally deep-dive into complex topics for mastery</p>
            </>
          )}
          {type === 'Consistency Builder' && (
            <>
              <p>• Your steady approach is building strong foundations</p>
              <p>• Consider progressively increasing difficulty levels</p>
              <p>• Leverage your consistency for mastering advanced topics</p>
            </>
          )}
        </div>
        <Button variant="secondary" className="w-full text-xs">
          View Personalized Roadmap
        </Button>
      </Card>
    </motion.div>
  );
}

function BehavioralTrait({ label, value, description, icon }) {
  const getIntensity = (v) => {
    if (v >= 0.75) return 'High';
    if (v >= 0.5) return 'Medium';
    return 'Low';
  };

  const getColor = (v) => {
    if (v >= 0.75) return 'bg-emerald-500';
    if (v >= 0.5) return 'bg-cyan-500';
    return 'bg-slate-500';
  };

  return (
    <Card className="p-4 bg-white/5 border border-white/10">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-wider">{label}</p>
          <p className="text-sm opacity-70 mt-1">{description}</p>
        </div>
        <span className="text-2xl flex-shrink-0">{icon}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value * 100}%` }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`h-full ${getColor(value)}`}
          />
        </div>
        <span className="text-xs font-medium opacity-60">{getIntensity(value)}</span>
      </div>
    </Card>
  );
}
