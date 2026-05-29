import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { LuSettings, LuX, LuToggle2, LuSliders } from 'react-icons/lu';

// preserve imports
void motion;
void AnimatePresence;
void Card;
void LuSettings;
void LuX;
void LuToggle2;
void LuSliders;
import { MentorPreferences } from '../../lib/mentor/MentorPreferences';

export function MentorPreferencesPanel({ userId, onClose }) {
  const [prefs, setPrefs] = useState(() => new MentorPreferences(userId));
  const [activeTab, setActiveTab] = useState('features'); // 'features' | 'intensity' | 'advanced'

  const handleToggleFeature = (feature) => {
    const key = {
      mentor: 'mentorEnabled',
      explainability: 'explainabilityEnabled',
      coaching: 'coachingEnabled',
      reflection: 'reflectionEnabled',
      sessionGuidance: 'sessionGuidanceEnabled'
    }[feature];

    const updated = {
      ...prefs.preferences,
      [key]: !prefs.preferences[key]
    };
    prefs.update(updated);
    setPrefs(new MentorPreferences(userId)); // Refresh
  };

  const handleSetCoachingIntensity = (level) => {
    prefs.setCoachingIntensity(level);
    setPrefs(new MentorPreferences(userId));
  };

  const handleSetReflectionFrequency = (frequency) => {
    prefs.setReflectionFrequency(frequency);
    setPrefs(new MentorPreferences(userId));
  };

  const handleSetSessionMax = (count) => {
    prefs.setSessionGuidanceMax(count);
    setPrefs(new MentorPreferences(userId));
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all mentor preferences to defaults?')) {
      prefs.resetToDefaults();
      setPrefs(new MentorPreferences(userId));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full max-w-md space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LuSettings size={18} className="text-cyan-400" />
          <h3 className="font-semibold">Mentor Settings</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Close"
        >
          <LuX size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'features', label: 'Features' },
          { id: 'intensity', label: 'Intensity' },
          { id: 'advanced', label: 'Advanced' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Features Tab */}
        {activeTab === 'features' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs opacity-70 mb-3">
              Control which mentor features are active
            </p>

            {[
              {
                id: 'mentor',
                label: 'Mentor (All)',
                description: 'Enable/disable entire mentor system'
              },
              {
                id: 'explainability',
                label: '"Why?" Explanations',
                description: 'Answer questions about recommendations'
              },
              {
                id: 'coaching',
                label: 'Coaching Insights',
                description: 'Learning strategy & pacing suggestions'
              },
              {
                id: 'reflection',
                label: 'Weekly Reflections',
                description: 'Learning pattern summaries'
              },
              {
                id: 'sessionGuidance',
                label: 'Session Guidance',
                description: 'Real-time learning session support'
              }
            ].map((feature) => (
              <div
                key={feature.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <button
                  onClick={() => handleToggleFeature(feature.id)}
                  className={`flex-shrink-0 p-2 rounded transition-colors ${
                    prefs.preferences[
                      {
                        mentor: 'mentorEnabled',
                        explainability: 'explainabilityEnabled',
                        coaching: 'coachingEnabled',
                        reflection: 'reflectionEnabled',
                        sessionGuidance: 'sessionGuidanceEnabled'
                      }[feature.id]
                    ]
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  <LuToggle2 size={16} />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium">{feature.label}</p>
                  <p className="text-xs opacity-60">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Intensity Tab */}
        {activeTab === 'intensity' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Coaching Intensity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LuSliders size={14} className="text-cyan-400" />
                <label className="text-sm font-medium">Coaching Intensity</label>
              </div>
              <p className="text-xs opacity-60 mb-2">
                How often mentor offers coaching suggestions
              </p>
              <div className="flex gap-2">
                {['low', 'moderate', 'high'].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSetCoachingIntensity(level)}
                    className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-colors ${
                      prefs.preferences.coachingIntensity === level
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Guidance Max */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Max Session Guidance Messages
              </label>
              <p className="text-xs opacity-60 mb-2">
                Limit interruptions during active learning (0 = disabled)
              </p>
              <div className="flex gap-2">
                {[0, 1, 3, 5].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleSetSessionMax(count)}
                    className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-colors ${
                      prefs.preferences.sessionGuidanceMaxPerSession === count
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {count === 0 ? 'Off' : count}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflection Frequency */}
            <div>
              <label className="text-sm font-medium block mb-2">
                Reflection Frequency
              </label>
              <p className="text-xs opacity-60 mb-2">
                How often to generate learning reflections
              </p>
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => handleSetReflectionFrequency(freq)}
                    className={`flex-1 px-2 py-2 rounded text-xs font-medium transition-colors ${
                      prefs.preferences.reflectionFrequency === freq
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs opacity-70 mb-3">Advanced mentor settings</p>

            {[
              {
                id: 'allowMentorMemory',
                label: 'Remember Conversations',
                description:
                  'Allow mentor to remember past discussions (improves context)'
              },
              {
                id: 'allowCoachingHistory',
                label: 'Track Coaching Patterns',
                description: 'Let mentor analyze your coaching preferences'
              },
              {
                id: 'allowReflectionTracking',
                label: 'Track Reflections',
                description: 'Allow pattern tracking across reflections'
              },
              {
                id: 'allowAnalytics',
                label: 'Mentor Analytics',
                description: 'Help improve mentor by tracking effectiveness'
              }
            ].map((setting) => (
              <div
                key={setting.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <button
                  onClick={() =>
                    prefs.update({
                      [setting.id]: !prefs.preferences[setting.id]
                    }) || setPrefs(new MentorPreferences(userId))
                  }
                  className={`flex-shrink-0 p-2 rounded transition-colors ${
                    prefs.preferences[setting.id]
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-white/5 text-white/40'
                  }`}
                >
                  <LuToggle2 size={16} />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs opacity-60">{setting.description}</p>
                </div>
              </div>
            ))}

            {/* Reset button */}
            <button
              onClick={handleResetDefaults}
              className="w-full px-3 py-2 mt-4 rounded text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 transition-colors"
            >
              Reset to Defaults
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer: Summary */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-xs opacity-60 mb-2">Current Status:</p>
        <div className="space-y-1 text-xs">
          {Object.entries(prefs.getSummary()).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="opacity-60 capitalize">{key}:</span>
              <span className="opacity-80">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default MentorPreferencesPanel;
