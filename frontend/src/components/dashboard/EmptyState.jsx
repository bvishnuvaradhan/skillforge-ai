import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LuPlus, LuZap, LuCompass } from 'react-icons/lu';

export function EmptyState({ type = 'profiles', onAction }) {
  const configs = {
    profiles: {
      title: 'No Profiles Connected',
      description: 'Link your GitHub, LeetCode, or CodeChef account to start building your Skill DNA.',
      icon: LuPlus,
      action: 'Connect Your First Profile',
    },
    data: {
      title: 'Generating Your Intelligence',
      description: 'Complete 5+ coding problems to generate your unique Skill DNA profile.',
      icon: LuZap,
      action: 'View Tracking',
    },
    recommendations: {
      title: 'No Recommendations Yet',
      description: 'Keep solving problems and your adaptive system will generate personalized recommendations.',
      icon: LuCompass,
      action: 'Explore Learning Paths',
    }
  };

  const config = configs[type] || configs.profiles;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="py-16 px-8 border-dashed border-white/20 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-6 inline-block"
        >
          <Icon size={48} className="text-cyan-400/40" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-sm opacity-50 max-w-sm mx-auto mb-6">{config.description}</p>
        <Button variant="primary" onClick={onAction} className="text-xs">
          {config.action}
        </Button>
      </Card>
    </motion.div>
  );
}
