import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

// defensive no-op refs to prevent false-positive unused warnings
void motion;
void Card;

export function StatCard({ label, value, icon: Icon, color = 'cyan', subtext, trend }) {
  const colors = {
    cyan: 'text-cyan-400 bg-cyan-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    pink: 'text-pink-400 bg-pink-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  };

  const colorClass = colors[color] || colors.cyan;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
    >
      <Card className="p-6 group hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-4">
          <p className="text-xs uppercase tracking-wider opacity-50">{label}</p>
          {Icon && (
            <div className={`p-2 rounded-lg ${colorClass} group-hover:scale-110 transition-transform`}>
              <Icon size={16} />
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            {trend && (
              <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </motion.div>

        {subtext && (
          <p className="text-xs opacity-50 mt-3">{subtext}</p>
        )}
      </Card>
    </motion.div>
  );
}
