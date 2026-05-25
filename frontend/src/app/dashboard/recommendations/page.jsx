import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RecommendationCard } from '../components/ui/RecommendationCard';
import { RecommendationExplainability, ExplainOnChange, TraceViewer, StabilityIndicator } from '../components/dashboard/Explainability';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LuArrowLeft, LuFilter } from 'react-icons/lu';

export function RecommendationsPage({ onBack }) {
  const [selectedRec, setSelectedRec] = useState(0);
  const [showTrace, setShowTrace] = useState(false);
  const [filter, setFilter] = useState('all');

  // Mock recommendations
  const mockRecommendations = [
    {
      id: '1',
      title: 'Practice: Dynamic Programming - Coin Change',
      state: 'active',
      whyThisNow: 'Your retention in Dynamic Programming has dropped 14% over 7 days. This classic pattern problem will reinforce your foundation.',
      confidence: 0.88,
      effort: '20m',
      impact: 'High',
      urgency: 'High',
      stability: 0.85,
      evidence: [
        'Retention score declined from 0.75 to 0.61',
        'Pattern dependency (Graphs) readiness increased to 0.9',
        'You typically need 2-3 days of practice after decay starts',
      ],
      dependencies: ['Recursion', 'Memoization'],
      triggers: ['Retention Decay', 'Dependency Readiness', 'Historical Pattern'],
      explanation: 'Dynamic Programming moved to priority because retention dropped below 0.6 and your Graph skills are ready for the advanced traversal patterns.',
    },
    {
      id: '2',
      title: 'Explore: Backtracking Patterns',
      state: 'exploring',
      whyThisNow: 'You\'ve mastered Recursion (88%) and shown strength in exploring complex patterns. Backtracking is a natural next step.',
      confidence: 0.72,
      effort: '30m',
      impact: 'Medium',
      urgency: 'Medium',
      stability: 0.65,
      evidence: [
        'Your exploration score suggests you enjoy pattern discovery',
        'Backtracking complements your Deep Diver learning style',
        'Strong performance on nested problem scenarios',
      ],
      dependencies: ['Recursion', 'Dynamic Programming'],
      triggers: ['Learning Style Match', 'Skill Readiness', 'Exploration Score'],
    },
    {
      id: '3',
      title: 'Reinforce: Two Pointers Review',
      state: 'reinforcing',
      whyThisNow: 'You haven\'t revisited Two Pointers in 14 days. A quick review will maintain your mastery.',
      confidence: 0.92,
      effort: '10m',
      impact: 'Low',
      urgency: 'Low',
      stability: 0.91,
      evidence: [
        'Last solved 14 days ago (retention decay normal)',
        'You typically solve 3-5 problems per reinforcement cycle',
        'Historical mastery was 0.85+',
      ],
      dependencies: [],
      triggers: ['Retention Maintenance', 'Mastery Preservation'],
    },
  ];

  const filteredRecs = filter === 'all' ? mockRecommendations :
                       mockRecommendations.filter(r => r.state === filter);

  const currentRec = filteredRecs[selectedRec];
  const previousRec = selectedRec > 0 ? filteredRecs[selectedRec - 1] : null;

  const mockTrace = {
    duration: 12,
    score: currentRec.confidence,
    events: [
      {
        type: 'signal',
        name: 'Retention Signal',
        description: 'DP retention dropped below threshold',
        value: '61% (was 75%)',
        details: 'Signal source: retentionEngine.calculateDecay(). Ebbinghaus model predicts 2-3 day recovery needed.',
      },
      {
        type: 'signal',
        name: 'Dependency Readiness',
        description: 'Prerequisite skills now ready',
        value: '90% readiness',
        details: 'Graph traversal mastery enables advanced DP patterns.',
      },
      {
        type: 'governance',
        name: 'Conflict Resolution',
        description: 'Multiple signals → arbitration',
        value: 'DP vs Backtracking',
        details: 'Policy: retention > exploration when decay detected. DP prioritized.',
      },
      {
        type: 'arbitration',
        name: 'Final Decision',
        description: 'Recommendation generated',
        value: 'Score: 88%',
        details: 'Ranking: (confidence * 0.6) + (urgency * 0.3) + (difficulty_match * 0.1)',
      },
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
        <h1 className="text-4xl font-bold mb-2">Your Recommendations</h1>
        <p className="text-sm opacity-60">Adaptive learning suggestions tailored to your skill DNA and learning patterns</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'reinforcing', 'exploring'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-xs font-medium transition-all capitalize ${
              filter === f
                ? 'bg-cyan-500 text-white'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Layout: Cards on left, details on right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recommendation List */}
        <motion.div className="space-y-3">
          {filteredRecs.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: idx * 0.05 }}
              onClick={() => { setSelectedRec(idx); setShowTrace(false); }}
              className={`cursor-pointer transition-all ${
                selectedRec === idx ? 'ring-2 ring-cyan-400' : ''
              }`}
            >
              <Card depth={selectedRec === idx ? "level2" : "level1"} className={`p-4 cursor-pointer transition-all ${
                selectedRec === idx ? 'bg-cyan-500/20 border-cyan-500/50' : 'hover:border-white/20'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="text-xs opacity-50 uppercase tracking-wider">{rec.state}</p>
                    <p className="font-semibold text-sm line-clamp-2">{rec.title}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-70">{rec.effort}</span>
                  <span className="text-sm font-bold text-cyan-400">{Math.round(rec.confidence * 100)}%</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Details Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Explain on Change */}
          {previousRec && (
            <Card depth="level2" className="p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl -z-1" />
              <ExplainOnChange
                currentRec={currentRec}
                previousRec={previousRec}
                explanation={currentRec.explanation}
              />
            </Card>
          )}

          {/* Recommendation Card - Large View */}
          <Card depth="level2" className="p-4 relative overflow-hidden">
            <RecommendationCard rec={currentRec} />
          </Card>

          {/* Explainability Details */}
          <Card depth="level2" className="p-6">
            <RecommendationExplainability
              recommendation={currentRec}
              evidence={currentRec.evidence}
              confidence={currentRec.confidence}
              triggers={currentRec.triggers}
            />
          </Card>

          {/* Stability Indicator */}
          <Card depth="level1" className="p-4 flex items-center justify-between">
            <p className="text-sm opacity-70">Recommendation Stability</p>
            <StabilityIndicator score={currentRec.stability} />
          </Card>

          {/* Trace Viewer Toggle */}
          <Button
            variant="secondary"
            onClick={() => setShowTrace(!showTrace)}
            className="w-full text-xs"
          >
            {showTrace ? 'Hide Trace' : 'View Trace & Lineage'}
          </Button>

          {/* Trace Viewer */}
          {showTrace && (
            <Card depth="level2" className="p-6">
              <TraceViewer trace={mockTrace} onClose={() => setShowTrace(false)} />
            </Card>
          )}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

export default RecommendationsPage;
