import React from 'react';
import { motion } from 'framer-motion';
import { SkillDNAExperience } from '../components/dashboard/SkillDNAExperience';
import { Button } from '../components/ui/Button';
import { LuArrowLeft, LuDownload } from 'react-icons/lu';

export function SkillDNAPage({ onBack }) {
  const mockDNAData = {
    type: 'Deep Diver',
    confidence: 0.82,
    description: 'You master topics through deep, focused exploration of complex problems.',
    retryBehavior: 0.75,
    explorationBehavior: 0.45,
    difficultyPreference: 0.85,
    focusStyle: 'concentrated',
    learningRhythm: 'consistent',
    insights: [
      'You spend 2-3x longer on complex problems than average, gaining deep mastery',
      'Your mastery depth (88% avg) exceeds breadth, suggesting focus over exploration',
      'You benefit most from progressive difficulty increases in single problem domains',
      'Your retry pattern suggests persistence - you rarely give up on hard problems',
      'Weekly consistency is your strength - rarely skip days in your learning cycle',
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Skill DNA</h1>
            <p className="text-sm opacity-60">Unique learning archetype, behavioral patterns, and personalized recommendations</p>
          </div>
          <Button variant="secondary" icon={LuDownload} className="text-xs">
            Export Report
          </Button>
        </div>
      </div>

      {/* Full Experience */}
      <SkillDNAExperience dnaData={mockDNAData} />

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10"
      >
        <h3 className="text-lg font-semibold mb-4">How This Helps Your Learning</h3>
        <ul className="space-y-3 text-sm opacity-80">
          <li className="flex gap-3">
            <span className="text-cyan-400 font-bold">✓</span>
            <span>Recommendations are sequenced for deep mastery first, exploration second</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400 font-bold">✓</span>
            <span>Problem difficulty increases gradually within chosen topics</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400 font-bold">✓</span>
            <span>Reinforcement cycles respect your consistency schedule</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-400 font-bold">✓</span>
            <span>Learning paths prioritize foundational strength before breadth</span>
          </li>
        </ul>
      </motion.div>
    </motion.section>
  );
}

export default SkillDNAPage;
