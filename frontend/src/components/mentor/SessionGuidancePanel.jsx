import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuAlertCircle, LuTrendingDown, LuX, LuCheckCircle } from 'react-icons/lu';
import { Card } from '../ui/Card';

export function SessionGuidancePanel({
  guidance,
  onDismiss,
  onAccept,
  sessionMetrics = {}
}) {
  const [dismissed, setDismissed] = useState(false);

  if (!guidance || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss(guidance);
  };

  const handleAccept = () => {
    if (onAccept) onAccept(guidance);
    setDismissed(true);
  };

  // Icon based on guidance type
  const iconMap = {
    performance_drop: <TrendingDown size={18} />,
    accuracy_decline: <AlertCircle size={18} />,
    context_switching: <AlertCircle size={18} />,
    prolonged_activity: <AlertCircle size={18} />,
    positive_reinforcement: <CheckCircle size={18} />
  };

  const colorMap = {
    performance_drop: 'from-amber-500/20 to-amber-500/10',
    accuracy_decline: 'from-amber-500/20 to-amber-500/10',
    context_switching: 'from-blue-500/20 to-blue-500/10',
    prolonged_activity: 'from-red-500/20 to-red-500/10',
    positive_reinforcement: 'from-emerald-500/20 to-emerald-500/10'
  };

  const borderColorMap = {
    performance_drop: 'border-amber-500/30',
    accuracy_decline: 'border-amber-500/30',
    context_switching: 'border-blue-500/30',
    prolonged_activity: 'border-red-500/30',
    positive_reinforcement: 'border-emerald-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20, y: -10 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <Card
        depth="level2"
        className={`bg-gradient-to-r ${colorMap[guidance.type]} border ${borderColorMap[guidance.type]} max-w-sm`}
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="text-cyan-400 flex-shrink-0 mt-0.5">
              {iconMap[guidance.type]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{guidance.message}</p>
              {guidance.action === 'suggestion' && (
                <p className="text-xs opacity-70 mt-1">
                  Confidence: {Math.round(guidance.confidence * 100)}%
                </p>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/50 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <LuX size={16} />
            </button>
          </div>

          {/* Session metrics (if provided) */}
          {Object.keys(sessionMetrics).length > 0 && (
            <div className="bg-black/30 rounded px-2 py-2 text-xs opacity-80 space-y-1">
              <div className="flex justify-between">
                <span>Session Time:</span>
                <span className="font-medium">
                  {sessionMetrics.elapsedMinutes}m
                </span>
              </div>
              <div className="flex justify-between">
                <span>Problems:</span>
                <span className="font-medium">
                  {sessionMetrics.problemsSolved}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-medium">
                  {sessionMetrics.averageAccuracy}%
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {guidance.action === 'suggestion' && (
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 px-3 py-2 rounded text-xs font-medium bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-colors"
              >
                Take a Break
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 px-3 py-2 rounded text-xs font-medium bg-white/5 hover:bg-white/10 transition-colors"
              >
                Keep Going
              </button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Session guidance stack (shows multiple guidance items)
export function SessionGuidanceStack({
  guidanceList = [],
  onDismiss,
  onAccept,
  sessionMetrics = {},
  maxVisible = 1
}) {
  const visibleGuidance = guidanceList.slice(0, maxVisible);

  return (
    <div className="fixed bottom-6 right-6 z-30 space-y-3 max-w-sm pointer-events-auto">
      <AnimatePresence mode="popLayout">
        {visibleGuidance.map((guidance, index) => (
          <SessionGuidancePanel
            key={guidance.timestamp || index}
            guidance={guidance}
            onDismiss={onDismiss}
            onAccept={onAccept}
            sessionMetrics={sessionMetrics}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Session summary (shown at end)
export function SessionSummary({
  sessionData = {},
  onClose
}) {
  if (!sessionData.sessionSummary) {
    return null;
  }

  const { sessionSummary, fatigueSummary, recommendations } = sessionData;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card depth="elevated" className="p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Session Complete</h2>
            <p className="text-xs opacity-60">
              Here's a summary of your learning session
            </p>
          </div>

          {/* Metrics */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="opacity-70">Duration</span>
              <span className="font-medium">
                {sessionSummary.durationMinutes} minutes
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70">Problems Solved</span>
              <span className="font-medium">{sessionSummary.problemsSolved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70">Accuracy</span>
              <span className="font-medium">{sessionSummary.averageAccuracy}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70">Topic</span>
              <span className="font-medium text-cyan-400">
                {sessionSummary.focusTopic || 'Mixed'}
              </span>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold opacity-70">Recommendations</p>
              <ul className="space-y-1 text-xs">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 opacity-80">
                    <span className="text-cyan-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-sm font-medium transition-colors"
          >
            Done
          </button>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default SessionGuidancePanel;
