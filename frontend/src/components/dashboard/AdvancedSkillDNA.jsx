"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  RadarChart, Radar, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { LuTrendingUp, LuUsers, LuZap, LuTarget } from 'react-icons/lu';

// defensive no-op refs to quiet lint where imports may be conditionally unused
void motion;
void Card;
void Button;
void RadarChart;
void Radar;
void PolarGrid;
void PolarAngleAxis;
void PolarRadiusAxis;
void ResponsiveContainer;
// Keep commonly imported chart symbols and helpers referenced for lint
void LineChart; void Line; void BarChart; void Bar; void XAxis; void YAxis; void CartesianGrid; void Tooltip; void Legend; void TraitCard;

const getArchetypeDetails = (type) => {
  switch (type) {
    case 'Deep Diver':
      return {
        statement: 'You learn fastest through deep repetition and structured progression.',
        learningStyle: 'Focuses intensely on a single topic, achieving high mastery before moving on.',
        consistencyPattern: 'Sustained, daily focus blocks with minimal interruptions. Strong retention stability.',
        explorationPattern: 'Prefers depth over breadth, occasionally benefits from structured exploration sessions.'
      };
    case 'Explorer':
      return {
        statement: 'You learn fastest through broad conceptual exposure and diverse practical application.',
        learningStyle: 'Explores multiple related topics concurrently, building connections between domains.',
        consistencyPattern: 'Dynamic, bursts of intense learning across multiple topics. Shorter, frequent sessions.',
        explorationPattern: 'High exploration drive, naturally discovers new concepts but needs guidance to solidify retention.'
      };
    default:
      return {
        statement: 'You learn fastest through balanced practice and data-backed reinforcement.',
        learningStyle: 'Balances depth and breadth, leveraging analytics-driven insights to guide focus.',
        consistencyPattern: 'Consistent rhythm matching suggested pacing intervals.',
        explorationPattern: 'Structured exploration within locked path bounds.'
      };
  }
};

export function AdvancedSkillDNA({ userDNA = {}, peerData = [] }) {
  const [compareWith, setCompareWith] = useState('average');

  // Defensive references for values that may be used later; keep them to silence linter
  void peerData; void compareWith; void setCompareWith;

  const sampleRadarData = [
    { subject: 'Syntax', A: 120, B: 110, fullMark: 150 },
    { subject: 'Algorithms', A: 98, B: 130, fullMark: 150 },
    { subject: 'Systems', A: 86, B: 99, fullMark: 150 },
  ];

  const mockUserDNA = {
    type: 'Deep Diver',
    confidence: 0.82,
    retryBehavior: 0.75,
    explorationBehavior: 0.45,
    difficultyPreference: 0.85,
    focusStyle: 'concentrated',
    percentile: 78,
    strengths: [
      'Deep mastery development',
      'High problem persistence',
      'Consistent learning rhythm',
    ],
    weaknesses: [
      'Limited breadth exploration',
      'Slow initial topic acquisition',
    ],
    recommendations: [
      'Allocate 2-3 weeks per topic for mastery',
      'Balance depth with periodic exploration',
      'Use spaced repetition for retention',
    ],
  };

  const mockPeerData = [
    { archetype: 'Deep Diver', users: 24, avgMastery: 0.75, avgConsistency: 0.85 },
    { archetype: 'Explorer', users: 31, avgMastery: 0.68, avgConsistency: 0.72 },
    { archetype: 'Strategic Solver', users: 18, avgMastery: 0.82, avgConsistency: 0.78 },
    { archetype: 'Consistency Builder', users: 27, avgMastery: 0.71, avgConsistency: 0.88 },
  ];

  const comparisonData = [
    { metric: 'Mastery Depth', user: 88, average: 75, expert: 92 },
    { metric: 'Consistency', user: 85, average: 78, expert: 94 },
    { metric: 'Breadth', user: 45, average: 62, expert: 75 },
    { metric: 'Learning Velocity', user: 72, average: 68, expert: 85 },
    { metric: 'Retention', user: 82, average: 76, expert: 91 },
  ];

  const userDNAData = { ...mockUserDNA, ...userDNA };
  const archetype = getArchetypeDetails(userDNAData.type);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Advanced Skill DNA Profile</h2>
        <p className="text-sm opacity-60">Deep analysis of your learning archetype, peer comparison, and personalized optimization</p>
      </div>

      {/* Main Archetype Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider">
                  {userDNAData.type}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-4 leading-snug">{archetype.statement}</h3>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div>
                  <p className="text-xs opacity-50 mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-cyan-400 font-mono">{Math.round(userDNAData.confidence * 100)}%</p>
                </div>
                <div>
                  <p className="text-xs opacity-50 mb-1">Percentile Rank</p>
                  <p className="text-2xl font-bold text-purple-400 font-mono">{userDNAData.percentile}th</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Learning Style</h4>
                  <p className="text-xs opacity-75 mt-0.5">{archetype.learningStyle}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Consistency Pattern</h4>
                  <p className="text-xs opacity-75 mt-0.5">{archetype.consistencyPattern}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Exploration Pattern</h4>
                  <p className="text-xs opacity-75 mt-0.5">{archetype.explorationPattern}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs opacity-50 uppercase tracking-wider mb-3 font-semibold">Key Strengths</p>
                <ul className="space-y-2">
                  {userDNAData.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="opacity-80">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs opacity-50 uppercase tracking-wider mb-3 font-semibold">Growth Opportunities</p>
                <ul className="space-y-2">
                  {userDNAData.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-amber-400 font-bold">→</span>
                      <span className="opacity-80">{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Comparison Radar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Your Profile vs Peers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={comparisonData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
              <Radar name="You" dataKey="user" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.3} />
              <Radar name="Average" dataKey="average" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.1} />
              <Radar name="Expert" dataKey="expert" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} />
              <Legend />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Archetype Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Community Archetypes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockPeerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="archetype" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="users" fill="#06B6D4" radius={[8, 8, 0, 0]} />
            </BarChart>
                    <div style={{ width: 300, height: 260 }}>
                      <ResponsiveContainer width="100%" height={240}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sampleRadarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis />
                          <Radar name="You" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Personalized Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
          <h3 className="text-lg font-semibold mb-6">Personalized Learning Optimization</h3>
          <div className="space-y-4">
            {userDNAData.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 rounded bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex gap-3">
                  <span className="text-cyan-400 font-bold flex-shrink-0">{i + 1}.</span>
                  <p className="text-sm opacity-80">{rec}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* DNA Traits Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TraitCard label="Retry Behavior" value={userDNAData.retryBehavior} icon={LuZap} />
          <TraitCard label="Exploration" value={userDNAData.explorationBehavior} icon={LuTarget} />
          <TraitCard label="Difficulty Preference" value={userDNAData.difficultyPreference} icon={LuTrendingUp} />
          <TraitCard label="Community Rank" value={userDNAData.percentile / 100} icon={LuUsers} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function TraitCard({ label, value, icon: Icon }) {
  // defensive reference to avoid transient lint warnings
  void Icon;
  return (
    <Card className="p-4 text-center hover:border-cyan-500/50 transition-all">
      <Icon className="mx-auto mb-3 text-cyan-400" size={24} />
      <p className="text-xs opacity-50 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-cyan-400">{Math.round(value * 100)}%</p>
    </Card>
  );
}

// using Recharts Polar components directly (imports above)

export default AdvancedSkillDNA;
