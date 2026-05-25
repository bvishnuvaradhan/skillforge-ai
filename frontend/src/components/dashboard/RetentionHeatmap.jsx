import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { LuInfo } from 'react-icons/lu';

export function RetentionHeatmap({ topicStats = [], maxTopics = 12 }) {
  const heatmapData = useMemo(() => {
    return topicStats.slice(0, maxTopics).map(topic => {
      const retention = (topic.retentionScore || 0) * 100;
      const days = topic.daysSinceSolved || 0;

      let color, bgColor, intensity;
      if (retention >= 80) {
        intensity = 'high';
        color = 'text-emerald-400';
        bgColor = 'bg-emerald-500/40';
      } else if (retention >= 60) {
        intensity = 'medium-high';
        color = 'text-cyan-400';
        bgColor = 'bg-cyan-500/30';
      } else if (retention >= 40) {
        intensity = 'medium';
        color = 'text-yellow-400';
        bgColor = 'bg-yellow-500/25';
      } else if (retention >= 20) {
        intensity = 'medium-low';
        color = 'text-orange-400';
        bgColor = 'bg-orange-500/20';
      } else {
        intensity = 'low';
        color = 'text-red-400';
        bgColor = 'bg-red-500/20';
      }

      return {
        topic: topic.topic || 'Unknown',
        retention,
        color,
        bgColor,
        intensity,
        days,
        masteryScore: topic.masteryScore || 0
      };
    });
  }, [topicStats, maxTopics]);

  if (heatmapData.length === 0) {
    return (
      <Card className="p-8 text-center opacity-40 border-dashed">
        <LuInfo size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No retention data available yet</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-red-400 rounded-full animate-pulse" />
            Retention Heat Map
          </h3>
          <p className="text-xs opacity-50 mt-2">Topic decay status and reinforcement priority</p>
        </div>

        <div className="space-y-3">
          {heatmapData.map((item, idx) => (
            <motion.div
              key={item.topic}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-cyan-300 transition-colors">
                    {item.topic}
                  </p>
                  <p className="text-xs opacity-40">
                    {item.masteryScore.toFixed(0)}% mastery • {item.days}d no review
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${item.color}`}>
                    {item.retention.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.retention}%` }}
                  transition={{ delay: 0.1 + idx * 0.05, duration: 0.8 }}
                  className={`h-full ${item.bgColor} rounded-full`}
                  style={{
                    background: `linear-gradient(90deg, ${
                      item.intensity === 'high' ? 'rgba(16, 185, 129, 0.6)' :
                      item.intensity === 'medium-high' ? 'rgba(34, 211, 238, 0.5)' :
                      item.intensity === 'medium' ? 'rgba(234, 179, 8, 0.4)' :
                      item.intensity === 'medium-low' ? 'rgba(251, 146, 60, 0.35)' :
                      'rgba(239, 68, 68, 0.3)'
                    }, transparent)`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="text-center">
              <div className="w-3 h-3 bg-emerald-500/40 rounded mb-1 mx-auto" />
              <p className="opacity-50">Strong</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-cyan-500/30 rounded mb-1 mx-auto" />
              <p className="opacity-50">Good</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-yellow-500/25 rounded mb-1 mx-auto" />
              <p className="opacity-50">Fair</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-orange-500/20 rounded mb-1 mx-auto" />
              <p className="opacity-50">Weak</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-red-500/20 rounded mb-1 mx-auto" />
              <p className="opacity-50">Critical</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
