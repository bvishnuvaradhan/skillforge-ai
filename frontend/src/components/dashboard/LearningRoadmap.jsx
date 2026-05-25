import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LuCheckCircle2, LuCircle, LuLock, LuArrowRight, LuStar } from 'react-icons/lu';

export function LearningRoadmap({ topics = [], currentTopic = null, recommendedPath = [] }) {
  const [expandedTopic, setExpandedTopic] = React.useState(null);

  const topicsByCategory = useMemo(() => {
    const grouped = {};
    topics.forEach(topic => {
      const category = topic.category || 'Uncategorized';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(topic);
    });
    return grouped;
  }, [topics]);

  const getTopicStatus = (topic) => {
    if (topic.mastery >= 0.8) return 'mastered';
    if (topic.mastery >= 0.5) return 'developing';
    if (topic.recommended) return 'recommended';
    if (topic.readiness < 0.3) return 'locked';
    return 'available';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold mb-2">Your Learning Roadmap</h2>
        <p className="text-sm opacity-60">Interactive knowledge galaxy mapping your skill progression</p>
      </div>

      {Object.entries(topicsByCategory).map(([category, categoryTopics], catIdx) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: catIdx * 0.1 }}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-cyan-400 uppercase tracking-wider text-sm">
              {category}
            </h3>
          </div>

          <div className="space-y-2">
            {categoryTopics.map((topic, idx) => (
              <RoadmapNode
                key={topic.id}
                topic={topic}
                status={getTopicStatus(topic)}
                isRecommended={recommendedPath.includes(topic.id)}
                isExpanded={expandedTopic === topic.id}
                onToggle={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                recommended={recommendedPath.includes(topic.id)}
              />
            ))}
          </div>
        </motion.div>
      ))}

      <Milestones topics={topics} />
    </motion.div>
  );
}

function RoadmapNode({ topic, status, isRecommended, isExpanded, onToggle, recommended }) {
  const statusConfig = {
    mastered: {
      icon: LuCheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      label: 'Mastered',
    },
    developing: {
      icon: LuCircle,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      label: 'Developing',
    },
    recommended: {
      icon: LuStar,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      label: 'Recommended',
    },
    available: {
      icon: LuCircle,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10 border-slate-500/20',
      label: 'Available',
    },
    locked: {
      icon: LuLock,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      label: 'Locked',
    },
  };

  const config = statusConfig[status] || statusConfig.available;
  const Icon = config.icon;

  return (
    <motion.div layout>
      <Card
        className={`p-4 border cursor-pointer transition-all hover:shadow-lg ${config.bgColor}`}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`${config.color} flex-shrink-0 mt-1`} size={20} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">{topic.name}</h4>
                {recommended && (
                  <span className="text-[10px] px-2 py-1 bg-amber-500/30 text-amber-300 rounded-full">
                    SUGGESTED
                  </span>
                )}
              </div>
              <p className="text-xs opacity-60">{topic.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400">{Math.round((topic.mastery || 0) * 100)}%</p>
              <p className="text-xs opacity-50">{config.label}</p>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <LuArrowRight size={20} className="text-slate-500" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-sm">
                {topic.prerequisites?.length > 0 && (
                  <div>
                    <p className="text-xs opacity-50 uppercase tracking-wider mb-2">Prerequisites</p>
                    <div className="flex flex-wrap gap-2">
                      {topic.prerequisites.map((pre, i) => (
                        <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">
                          {pre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {topic.relatedTopics?.length > 0 && (
                  <div>
                    <p className="text-xs opacity-50 uppercase tracking-wider mb-2">Related Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {topic.relatedTopics.map((related, i) => (
                        <span key={i} className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                          {related}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="secondary" className="text-xs">
                    Start Learning
                  </Button>
                  <Button variant="ghost" className="text-xs">
                    View Resources
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function Milestones({ topics }) {
  const milestones = [
    { level: 3, name: 'Foundation', icon: '🏗️', minTopics: 5 },
    { level: 6, name: 'Intermediate', icon: '📚', minTopics: 12 },
    { level: 8, name: 'Advanced', icon: '🚀', minTopics: 20 },
    { level: 10, name: 'Expert', icon: '⭐', minTopics: 30 },
  ];

  const masteredCount = topics.filter(t => (t.mastery || 0) >= 0.8).length;
  const avgMastery = topics.length > 0 ? topics.reduce((sum, t) => sum + (t.mastery || 0), 0) / topics.length : 0;

  return (
    <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10">
      <h3 className="text-lg font-semibold mb-4">Milestones</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {milestones.map((milestone, idx) => {
          const isAchieved = avgMastery >= milestone.level / 10;
          const isCurrent = avgMastery >= (milestone.level - 2) / 10 && avgMastery < milestone.level / 10;

          return (
            <motion.div
              key={milestone.level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg border text-center transition-all ${
                isAchieved
                  ? 'bg-emerald-500/20 border-emerald-500/40'
                  : isCurrent
                  ? 'bg-cyan-500/20 border-cyan-500/40 ring-2 ring-cyan-400/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <p className="text-2xl mb-2">{milestone.icon}</p>
              <p className="font-semibold text-sm mb-1">{milestone.name}</p>
              <p className="text-xs opacity-50">{milestone.level * 10}% mastery</p>
            </motion.div>
          );
        })}
      </div>
      <p className="text-xs opacity-60 mt-4 text-center">
        You've mastered <span className="font-bold text-emerald-400">{masteredCount} topics</span> • Current: <span className="font-bold text-cyan-400">{Math.round(avgMastery * 100)}%</span>
      </p>
    </Card>
  );
}

export default LearningRoadmap;
