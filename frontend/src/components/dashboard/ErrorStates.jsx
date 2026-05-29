import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LuCircleAlert, LuWifiOff, LuRotateCw } from 'react-icons/lu';

// defensive refs to keep imports available and silence no-unused-vars
void motion; void Card; void Button; void LuCircleAlert; void LuWifiOff; void LuRotateCw;

export function ErrorState({ type = 'sync', title, message, onRetry, action }) {
  const configs = {
    sync: {
      icon: LuRotateCw,
      title: 'Sync Failed',
      message: 'Unable to sync your coding profiles. Please check your connection and try again.',
      actionLabel: 'Retry Sync',
    },
    network: {
      icon: LuWifiOff,
      title: 'Connection Lost',
      message: 'Unable to reach SkillForge servers. Check your internet connection.',
      actionLabel: 'Retry',
    },
    data: {
      icon: LuCircleAlert,
      title: 'No Data Available',
      message: 'Your intelligence engine needs more data. Keep solving problems!',
      actionLabel: 'View Tracking',
    },
    stale: {
      icon: LuCircleAlert,
      title: 'Data May Be Stale',
      message: 'Your profile sync is outdated. Last synced 7 days ago.',
      actionLabel: 'Sync Now',
    },
  };

  const config = configs[type] || configs.sync;
  const Icon = config.icon;
  const finalTitle = title || config.title;
  const finalMessage = message || config.message;
  const actionText = action || config.actionLabel;

  // Keep Icon referenced to avoid unused-var warnings in certain builds
  void Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="p-6 border-l-4 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-amber-500/5">
        <div className="flex gap-4">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex-shrink-0"
          >
            <Icon size={24} className="text-amber-400" />
          </motion.div>

          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{finalTitle}</h3>
            <p className="text-sm opacity-70 mb-4">{finalMessage}</p>

            {onRetry && (
              <Button
                variant="secondary"
                onClick={onRetry}
                className="text-xs"
              >
                {actionText}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function SkeletonLoader({ count = 3, type = 'card' }) {
  const skeletons = Array(count).fill(0);

  if (type === 'card') {
    return (
      <div className="space-y-4">
        {skeletons.map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-lg bg-white/5 border border-white/10 p-4 h-24"
          />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="rounded-lg bg-white/5 border border-white/10 p-8 h-64"
      />
    );
  }

  return null;
}

export function LoadingIndicator({ message = 'Loading...', size = 'base' }) {
  const sizes = {
    sm: 'w-6 h-6',
    base: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-2 border-cyan-400 border-t-transparent rounded-full`}
      />
      {message && <p className="text-sm opacity-70">{message}</p>}
    </motion.div>
  );
}

export function TimeoutState({ onRetry, message = 'Request timed out' }) {
  return (
    <Card className="p-8 text-center border border-red-500/30 bg-red-500/10">
      <LuCircleAlert size={32} className="mx-auto mb-3 text-red-400 opacity-70" />
      <p className="text-sm font-medium mb-2">{message}</p>
      <p className="text-xs opacity-50 mb-4">This is taking longer than expected</p>
      <Button variant="secondary" onClick={onRetry} className="text-xs">
        Try Again
      </Button>
    </Card>
  );
}

export function OfflineState() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="fixed top-0 left-0 right-0 bg-red-900/90 backdrop-blur-sm border-b border-red-500 z-50"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <LuWifiOff size={18} className="text-red-300" />
        <p className="text-sm text-red-200">
          You're offline. Some features may not work until your connection is restored.
        </p>
      </div>
    </motion.div>
  );
}
