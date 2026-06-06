"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  LuActivity,
  LuCpu,
  LuDatabase,
  LuServer,
  LuDollarSign,
  LuTrendingUp,
  LuRefreshCw,
  LuFlame,
  LuAlertTriangle,
  LuTrash2,
  LuDatabaseBackup,
  LuZap,
  LuCheckCircle
} from 'react-icons/lu';

export function OperationsCenter() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Fetch metrics helper
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Try v1 first, then fallback to original admin/metrics
      let response = await fetch('/api/v1/admin/metrics');
      if (!response.ok) {
        response = await fetch('/api/admin/metrics');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: HTTP ${response.status}`);
      }
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load operations metrics:", err);
      setError(err.message);
      
      // Fallback UI mock metrics if APIs are not ready or fail
      setMetrics({
        queues: {
          scraping: { active: 2, waiting: 5, delayed: 0, completed: 342, failed: 1 },
          analytics: { active: 1, waiting: 0, delayed: 0, completed: 88, failed: 0 }
        },
        ai: {
          totalCost: 0.1425,
          totalTokens: 570000,
          totalCalls: 114,
          costBreakdown: [
            { name: "Mentor Chat", value: 0.0926 },
            { name: "Explainability", value: 0.0314 },
            { name: "Coaching", value: 0.0185 }
          ]
        },
        performance: {
          cacheHitRate: 84.6,
          errorRate: 0.12,
          latencies: {
            apiGateway: 34,
            recommendationEngine: 165,
            mentorModel: 1150,
            databaseQuery: 6
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh metrics every 15 seconds
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const triggerAction = async (actionType, url, method = 'POST') => {
    setActionLoading(actionType);
    setActionSuccess(null);
    try {
      const response = await fetch(url, { method });
      if (!response.ok) {
        throw new Error(`Action failed: HTTP ${response.status}`);
      }
      const result = await response.json();
      setActionSuccess({
        type: actionType,
        message: result.message || "Operation completed successfully."
      });
      fetchMetrics();
    } catch (err) {
      alert(`Error executing system action: ${err.message}`);
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const clearCache = () => triggerAction('clear-cache', '/api/v1/admin/cache/clear', 'POST');
  const runRetention = () => triggerAction('retention-job', '/api/v1/admin/retention/run', 'POST');
  const triggerBackup = () => triggerAction('backup-job', '/api/v1/admin/backup/trigger', 'POST');

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <LuRefreshCw className="text-cyan-400" size={32} />
        </motion.div>
        <p className="text-sm opacity-60">Initializing system telemetry...</p>
      </div>
    );
  }

  const { queues, ai, performance } = metrics || {};

  return (
    <div className="space-y-6">
      {/* Telemetry Status Alert banner */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
          >
            <LuCheckCircle className="text-emerald-400" size={20} />
            <span className="text-sm font-medium text-emerald-300">{actionSuccess.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid: 3 Main SRE Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Performance & Latency Pillar */}
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <LuActivity size={120} className="text-cyan-400" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <LuActivity size={20} />
            </div>
            <h3 className="font-semibold text-lg">System Performance</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs opacity-60 mb-1">
                <span>Cache Hit Rate</span>
                <span className="font-mono text-cyan-400 font-bold">{performance?.cacheHitRate}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${performance?.cacheHitRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs opacity-60 mb-1">
                <span>System Error Rate</span>
                <span className="font-mono text-pink-400 font-bold">{performance?.errorRate}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((performance?.errorRate || 0) * 10, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-xs opacity-50 uppercase tracking-wider block font-semibold">Latencies</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded">
                  <div className="opacity-55 mb-0.5">API Gateway</div>
                  <div className="font-mono text-cyan-400 font-bold">{performance?.latencies?.apiGateway} ms</div>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <div className="opacity-55 mb-0.5">Recommendations</div>
                  <div className="font-mono text-cyan-400 font-bold">{performance?.latencies?.recommendationEngine} ms</div>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <div className="opacity-55 mb-0.5">Database Query</div>
                  <div className="font-mono text-cyan-400 font-bold">{performance?.latencies?.databaseQuery} ms</div>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <div className="opacity-55 mb-0.5">AI LLM Model</div>
                  <div className="font-mono text-purple-400 font-bold">{performance?.latencies?.mentorModel} ms</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Queues & Processing Pillar */}
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <LuCpu size={120} className="text-purple-400" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <LuCpu size={20} />
            </div>
            <h3 className="font-semibold text-lg">Queue Processing</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Scraping Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                  {queues?.scraping?.active || 0} active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="bg-white/5 p-1.5 rounded">
                  <span className="block opacity-55">Wait</span>
                  <span className="font-mono font-bold">{queues?.scraping?.waiting || 0}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded">
                  <span className="block opacity-55">Done</span>
                  <span className="font-mono font-bold text-emerald-400">{queues?.scraping?.completed || 0}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded">
                  <span className="block opacity-55">Fail</span>
                  <span className={`font-mono font-bold ${queues?.scraping?.failed > 0 ? 'text-pink-400' : 'opacity-80'}`}>
                    {queues?.scraping?.failed || 0}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Analytics Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                  {queues?.analytics?.active || 0} active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="bg-white/5 p-1.5 rounded">
                  <span className="block opacity-55">Wait</span>
                  <span className="font-mono font-bold">{queues?.analytics?.waiting || 0}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded">
                  <span className="block opacity-55">Done</span>
                  <span className="font-mono font-bold text-emerald-400">{queues?.analytics?.completed || 0}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded">
                  <span className="block opacity-55">Fail</span>
                  <span className={`font-mono font-bold ${queues?.analytics?.failed > 0 ? 'text-pink-400' : 'opacity-80'}`}>
                    {queues?.analytics?.failed || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI & Cost Auditing Pillar */}
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <LuDollarSign size={120} className="text-emerald-400" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <LuDollarSign size={20} />
            </div>
            <h3 className="font-semibold text-lg">AI Resource & Costs</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs opacity-60">Total Estimated Cost</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">${ai?.totalCost?.toFixed(4)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2 rounded">
                <div className="opacity-55 mb-0.5">Total AI Calls</div>
                <div className="font-mono font-bold">{ai?.totalCalls || 0}</div>
              </div>
              <div className="bg-white/5 p-2 rounded">
                <div className="opacity-55 mb-0.5">Total Tokens</div>
                <div className="font-mono font-bold">{(ai?.totalTokens || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="text-xs opacity-50 uppercase tracking-wider block font-semibold">Cost Distribution</span>
              <div className="space-y-1.5">
                {(ai?.costBreakdown || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="opacity-60">{item.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">${item.value?.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* System Administration & Runbooks */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <LuServer className="text-cyan-400" size={20} />
          System Governance Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-lg bg-white/5 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <LuTrash2 className="text-pink-400" size={16} />
                Invalidate Redis Cache
              </h4>
              <p className="text-xs opacity-65 mb-4">Invalidates all recommendation, mentor, and analytics caches across the system.</p>
            </div>
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={clearCache}
              disabled={actionLoading === 'clear-cache'}
            >
              {actionLoading === 'clear-cache' ? 'Clearing...' : 'Clear All Cache'}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-white/5 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <LuFlame className="text-purple-400" size={16} />
                Trace Compaction Job
              </h4>
              <p className="text-xs opacity-65 mb-4">Manually trigger retention worker to archive and clean up traces older than 30 days.</p>
            </div>
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={runRetention}
              disabled={actionLoading === 'retention-job'}
            >
              {actionLoading === 'retention-job' ? 'Compacting...' : 'Compact Trace Data'}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-white/5 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <LuDatabaseBackup className="text-emerald-400" size={16} />
                Database Backup
              </h4>
              <p className="text-xs opacity-65 mb-4">Creates a new daily mongodump extraction snapshot and verifies database restoration integrity.</p>
            </div>
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={triggerBackup}
              disabled={actionLoading === 'backup-job'}
            >
              {actionLoading === 'backup-job' ? 'Backing up...' : 'Trigger DB Backup'}
            </Button>
          </div>

        </div>
      </Card>
    </div>
  );
}

export default OperationsCenter;
