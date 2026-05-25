import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LuCheck, LuArrowRight, LuGithub, LuExternalLink } from 'react-icons/lu';

export function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [linkedProfiles, setLinkedProfiles] = useState([]);
  const [learningStyle, setLearningStyle] = useState(null);

  const steps = [
    { title: 'Welcome', subtitle: 'Let\'s set up your learning profile' },
    { title: 'Learning Goals', subtitle: 'What do you want to achieve?' },
    { title: 'Connect Profiles', subtitle: 'Link your coding accounts' },
    { title: 'Learning Style', subtitle: 'Understand how you learn best' },
    { title: 'Roadmap Generation', subtitle: 'Create your personalized path' },
    { title: 'Done!', subtitle: 'Ready to start learning' },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
            />
          </div>
          <div className="flex justify-between mt-3">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                className={`text-xs font-medium ${i <= step ? 'text-cyan-400 opacity-100' : 'text-slate-500 opacity-50'}`}
              >
                {i + 1}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content */}
        <Card className="p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && <WelcomeStep />}

              {/* Step 1: Goals */}
              {step === 1 && (
                <GoalsStep goals={goals} setGoals={setGoals} />
              )}

              {/* Step 2: Connect Profiles */}
              {step === 2 && (
                <ProfileLinkStep linkedProfiles={linkedProfiles} setLinkedProfiles={setLinkedProfiles} />
              )}

              {/* Step 3: Learning Style */}
              {step === 3 && (
                <LearningStyleStep learningStyle={learningStyle} setLearningStyle={setLearningStyle} />
              )}

              {/* Step 4: Roadmap */}
              {step === 4 && <RoadmapGenerationStep />}

              {/* Step 5: Completion */}
              {step === 5 && <CompletionStep />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
            <Button
              variant="secondary"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-sm"
            >
              Back
            </Button>

            <div className="text-xs opacity-50">
              Step {step + 1} of {steps.length}
            </div>

            <Button
              variant="primary"
              onClick={() => {
                if (step === steps.length - 1) {
                  onComplete?.();
                } else {
                  setStep(Math.min(steps.length - 1, step + 1));
                }
              }}
              className="text-sm flex items-center gap-2"
            >
              {step === steps.length - 1 ? 'Start Learning' : 'Next'}
              <LuArrowRight size={14} />
            </Button>
          </div>
        </Card>

        {/* Step Indicator */}
        <div className="text-center mt-6 text-sm opacity-50">
          <p>{currentStep.title} — {currentStep.subtitle}</p>
        </div>
      </motion.div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <motion.div className="text-center space-y-6">
      <div className="text-5xl mb-4">🚀</div>
      <h2 className="text-3xl font-bold">Welcome to SkillForge AI</h2>
      <p className="text-lg opacity-70 max-w-md mx-auto">
        Let's set up your personalized learning profile so we can create the perfect path for your growth.
      </p>
      <p className="text-sm opacity-50">This takes about 5 minutes</p>
    </motion.div>
  );
}

function GoalsStep({ goals, setGoals }) {
  const goalOptions = [
    { id: 'interviews', label: 'Ace Coding Interviews', icon: '🎯' },
    { id: 'skills', label: 'Master Core Skills', icon: '📚' },
    { id: 'career', label: 'Advance My Career', icon: '📈' },
    { id: 'competitive', label: 'Competitive Programming', icon: '⚡' },
  ];

  return (
    <motion.div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">What are your learning goals?</h3>
        <p className="text-sm opacity-60 mb-6">Select one or more</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalOptions.map((goal) => (
          <motion.button
            key={goal.id}
            onClick={() => {
              setGoals(goals.includes(goal.id)
                ? goals.filter(g => g !== goal.id)
                : [...goals, goal.id]
              );
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              goals.includes(goal.id)
                ? 'bg-cyan-500/20 border-cyan-500'
                : 'bg-white/5 border-white/20 hover:border-cyan-500/50'
            }`}
          >
            <div className="text-2xl mb-2">{goal.icon}</div>
            <p className="font-semibold">{goal.label}</p>
            {goals.includes(goal.id) && (
              <div className="absolute top-3 right-3 text-cyan-400">
                <LuCheck size={20} />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ProfileLinkStep({ linkedProfiles, setLinkedProfiles }) {
  const platforms = [
    { id: 'github', label: 'GitHub', icon: LuGithub, color: 'hover:border-slate-400' },
    { id: 'leetcode', label: 'LeetCode', icon: '💻', color: 'hover:border-yellow-400' },
    { id: 'codechef', label: 'CodeChef', icon: '🏆', color: 'hover:border-amber-400' },
  ];

  return (
    <motion.div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Connect Your Coding Profiles</h3>
        <p className="text-sm opacity-60">We'll analyze your activity to understand your learning patterns</p>
      </div>

      <div className="space-y-3">
        {platforms.map((platform) => (
          <motion.button
            key={platform.id}
            onClick={() => {
              setLinkedProfiles(linkedProfiles.includes(platform.id)
                ? linkedProfiles.filter(p => p !== platform.id)
                : [...linkedProfiles, platform.id]
              );
            }}
            whileHover={{ x: 4 }}
            className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition-all ${
              linkedProfiles.includes(platform.id)
                ? 'bg-cyan-500/20 border-cyan-500'
                : 'bg-white/5 border-white/20 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              {typeof platform.icon === 'string' ? (
                <span className="text-2xl">{platform.icon}</span>
              ) : (
                <platform.icon size={24} />
              )}
              <span className="font-semibold">{platform.label}</span>
            </div>
            {linkedProfiles.includes(platform.id) ? (
              <LuCheck className="text-cyan-400" size={20} />
            ) : (
              <LuExternalLink className="opacity-50" size={20} />
            )}
          </motion.button>
        ))}
      </div>

      <p className="text-xs opacity-50 text-center">You can add more profiles anytime in settings</p>
    </motion.div>
  );
}

function LearningStyleStep({ learningStyle, setLearningStyle }) {
  const styles = [
    { id: 'deep', label: 'Deep Diver', description: 'Master one topic thoroughly before moving on' },
    { id: 'broad', label: 'Explorer', description: 'Enjoy learning diverse topics and making connections' },
    { id: 'strategic', label: 'Strategic Solver', description: 'Optimize efficiency and problem-solving speed' },
    { id: 'consistent', label: 'Consistency Builder', description: 'Prefer steady, regular practice' },
  ];

  return (
    <motion.div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">What's Your Learning Style?</h3>
        <p className="text-sm opacity-60">Help us personalize your recommendations</p>
      </div>

      <div className="space-y-3">
        {styles.map((style) => (
          <motion.button
            key={style.id}
            onClick={() => setLearningStyle(style.id)}
            whileHover={{ scale: 1.01 }}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              learningStyle === style.id
                ? 'bg-cyan-500/20 border-cyan-500'
                : 'bg-white/5 border-white/20 hover:border-cyan-500/50'
            }`}
          >
            <p className="font-semibold mb-1">{style.label}</p>
            <p className="text-sm opacity-60">{style.description}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function RoadmapGenerationStep() {
  return (
    <motion.div className="text-center space-y-6">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <div className="text-5xl mb-4">✨</div>
      </motion.div>
      <h3 className="text-2xl font-semibold">Generating Your Roadmap</h3>
      <p className="text-sm opacity-60 max-w-md mx-auto">
        We're analyzing your goals, learning style, and current skills to create a personalized learning path...
      </p>
      <motion.div className="h-1 bg-white/10 rounded-full overflow-hidden max-w-md mx-auto mt-6">
        <motion.div
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 3 }}
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
        />
      </motion.div>
    </motion.div>
  );
}

function CompletionStep() {
  return (
    <motion.div className="text-center space-y-6">
      <motion.div
        animate={{ scale: [0.8, 1.2, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-6xl mb-4">🎉</div>
      </motion.div>
      <h3 className="text-3xl font-bold">You're All Set!</h3>
      <p className="text-lg opacity-70 max-w-md mx-auto">
        Your personalized learning profile is ready. Let's start with your first recommendation.
      </p>
      <div className="pt-4 space-y-2 text-sm opacity-60">
        <p>✓ Profile connected</p>
        <p>✓ Learning path created</p>
        <p>✓ Recommendations ready</p>
      </div>
    </motion.div>
  );
}

export default OnboardingFlow;
