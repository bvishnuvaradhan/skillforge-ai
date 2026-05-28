import { motion } from 'framer-motion';
import { LuFirestarter, LuTrendingUp, LuZap } from 'react-icons/lu';

export function GreetingBlock({ userName, momentumScore, streak, energyLevel }) {
  const now = new Date().getHours();
  const getGreeting = () => {
    if (now < 12) return 'Good Morning';
    if (now < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMomentumMessage = () => {
    if (momentumScore >= 80) return 'Your learning momentum is exceptional.';
    if (momentumScore >= 60) return 'Your learning momentum is strong today.';
    if (momentumScore >= 40) return 'Your learning momentum is building.';
    return 'Your learning momentum needs a gentle push.';
  };

  const getMomentumIcon = () => {
    if (momentumScore >= 80) return <LuFirestarter className="text-amber-400" size={20} />;
    if (momentumScore >= 60) return <LuTrendingUp className="text-emerald-400" size={20} />;
    return <LuZap className="text-cyan-400" size={20} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-3"
    >
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-sm opacity-50 mt-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Momentum Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 text-sm md:text-base"
      >
        {getMomentumIcon()}
        <span className="opacity-70">{getMomentumMessage()}</span>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 text-xs opacity-60"
      >
        <div>
          <span className="font-medium text-white">{streak}</span> day streak
        </div>
        <div className="hidden sm:block">•</div>
        <div className="hidden sm:block">
          Energy: <span className="font-medium text-white">{energyLevel || 0}/10</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
