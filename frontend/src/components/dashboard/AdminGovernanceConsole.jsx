import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LuActivity, LuDatabaseBackup, LuSettings2, LuPlayCircle, LuAlertTriangle } from 'react-icons/lu';

export function AdminGovernanceConsole() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showReplayModal, setShowReplayModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LuActivity },
    { id: 'events', label: 'Events', icon: LuDatabaseBackup },
    { id: 'governance', label: 'Governance', icon: LuSettings2 },
    { id: 'replay', label: 'Replay Tools', icon: LuPlayCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin & Governance Console</h1>
        <p className="text-sm opacity-60">Operational visibility and control for SkillForge intelligence systems</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'governance' && <GovernanceTab />}
        {activeTab === 'replay' && <ReplayTab />}
      </div>
    </motion.div>
  );
}

function OverviewTab() {
  const stats = [
    { label: 'Active Users', value: '2,847', trend: '+12%' },
    { label: 'Recommendations Generated', value: '18,392', trend: '+8%' },
    { label: 'Avg Response Time', value: '42ms', trend: '-3%' },
    { label: 'System Health', value: '99.8%', trend: 'Excellent' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6">
              <p className="text-xs opacity-50 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
              <p className="text-xs opacity-60 mt-2">{stat.trend}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Activity (Last 24h)</h3>
        <div className="space-y-3">
          {[
            { time: '14:23', event: 'Policy updated', detail: 'Recommendation cooldown increased to 24h' },
            { time: '12:45', event: 'Compaction job completed', detail: 'Archived 2,384 old traces' },
            { time: '09:12', event: 'Governance audit passed', detail: 'All policies validated' },
            { time: '06:30', event: 'Telemetry aggregation', detail: 'Daily rollup completed' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 p-3 rounded bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-xs opacity-50 min-w-[50px]">{item.time}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.event}</p>
                <p className="text-xs opacity-60 mt-0.5">{item.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function EventsTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EventCard
          title="Queue Status"
          value="1,247"
          subtitle="Jobs processed today"
          status="healthy"
        />
        <EventCard
          title="Dead Letter Queue"
          value="3"
          subtitle="Failed events (retrying)"
          status="warning"
        />
        <EventCard
          title="Event Latency"
          value="8ms"
          subtitle="p95 percentile"
          status="healthy"
        />
      </div>

      {/* Event Log */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Event Stream</h3>
        <div className="space-y-2 font-mono text-xs max-h-64 overflow-y-auto">
          {[
            '2026-05-25T14:23:45.123Z [recommendation.generated] user=usr_123 confidence=0.88',
            '2026-05-25T14:23:41.892Z [governance.override] policy=retention_minimum result=passed',
            '2026-05-25T14:23:38.445Z [arbitration.completed] signals=4 winner=dp score=0.85',
            '2026-05-25T14:23:35.001Z [signal.decay] topic=Graphs retention=0.64',
            '2026-05-25T14:23:31.567Z [profile.synced] platform=github username=johndoe',
          ].map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="py-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              {log}
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function GovernanceTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6 border-l-4 border-amber-500 bg-amber-500/10">
        <div className="flex gap-3 items-start">
          <LuAlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-amber-300">Policy Warning</p>
            <p className="text-sm opacity-80 mt-1">Recommendation cooldown policy approaching daily limit (47/50 recommendations)</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PolicyCard
          title="Retention Minimum"
          description="Flags topics below mastery threshold for reinforcement"
          status="active"
          rules={['Min mastery: 0.6', 'Check interval: daily', 'Grace period: 7 days']}
        />
        <PolicyCard
          title="Recommendation Cooldown"
          description="Prevents duplicate recommendations within time window"
          status="active"
          rules={['Cooldown: 24 hours', 'Per topic', 'Overridable by governance']}
        />
        <PolicyCard
          title="Dependency Validation"
          description="Ensures prerequisites are met before recommending advanced topics"
          status="active"
          rules={['Min readiness: 0.7', 'Transitive check', 'Auto-unlock on mastery']}
        />
        <PolicyCard
          title="Governance Override"
          description="Manual intervention for exceptional cases"
          status="inactive"
          rules={['Requires admin auth', 'Audit logged', 'Expires in 7 days']}
        />
      </div>

      {/* Policy Simulator */}
      <Card className="p-6 bg-cyan-500/10 border border-cyan-500/30">
        <h3 className="text-lg font-semibold mb-4">Policy Simulator</h3>
        <p className="text-sm opacity-70 mb-4">Test policy changes against historical data</p>
        <Button variant="secondary" className="text-sm">
          Run Simulation
        </Button>
      </Card>
    </motion.div>
  );
}

function ReplayTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <h3 className="text-lg font-semibold mb-4">Replay Tools</h3>
        <p className="text-sm opacity-70 mb-6">Re-run historical recommendations to verify determinism and compare outputs</p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Select User</label>
            <input
              type="text"
              placeholder="user_abc123..."
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Replay Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm"
            />
          </div>
          <Button variant="primary" className="w-full text-sm flex items-center justify-center gap-2">
            <LuPlayCircle size={16} />
            Start Replay
          </Button>
        </div>
      </Card>

      {/* Replay Results */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Replays</h3>
        <div className="space-y-3">
          {[
            { user: 'user_892', date: '2026-05-25', status: '✓ Deterministic', diff: 'No differences' },
            { user: 'user_156', date: '2026-05-24', status: '✓ Deterministic', diff: 'No differences' },
            { user: 'user_743', date: '2026-05-23', status: '⚠ Variance detected', diff: 'Score ±2%, ordering identical' },
          ].map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded bg-white/5 text-sm"
            >
              <div>
                <p className="font-medium">{result.user}</p>
                <p className="text-xs opacity-50 mt-0.5">{result.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-1">{result.status}</p>
                <p className="text-xs opacity-60">{result.diff}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function EventCard({ title, value, subtitle, status }) {
  const statusColor = status === 'healthy' ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-amber-500/20 border-amber-500/50';

  return (
    <Card className={`p-6 border ${statusColor}`}>
      <p className="text-xs opacity-50 uppercase tracking-wider mb-2">{title}</p>
      <p className="text-3xl font-bold text-cyan-400 mb-1">{value}</p>
      <p className="text-xs opacity-60">{subtitle}</p>
    </Card>
  );
}

function PolicyCard({ title, description, status, rules }) {
  return (
    <Card className={`p-4 border ${status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-xs opacity-70 mb-3">{description}</p>
      <div className="space-y-1">
        {rules.map((rule, i) => (
          <p key={i} className="text-xs opacity-60">• {rule}</p>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className={`text-xs font-medium px-2 py-1 rounded ${status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'}`}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </span>
        <Button variant="ghost" className="text-xs">Edit</Button>
      </div>
    </Card>
  );
}

export default AdminGovernanceConsole;
