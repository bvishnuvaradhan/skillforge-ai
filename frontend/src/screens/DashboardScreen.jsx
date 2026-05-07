"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/useAuth";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SectionHeader } from "../components/ui/SectionHeader";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip
} from "recharts";
import { LuZap, LuActivity, LuBrainCircuit, LuRotateCcw, LuInfo, LuAlertTriangle, LuCheckCircle } from "react-icons/lu";

export function DashboardScreen() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeInsight, setActiveInsight] = useState(null);

  useEffect(() => {
    if (auth.ready && !auth.user) {
      router.replace("/login");
    }
  }, [auth.ready, router, auth.user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/analytics/dashboard");
        setData(res);
      } catch (err) {
        console.error("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (auth.user) fetchData();
  }, [auth.user]);

  if (!auth.ready || !auth.user || loading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-cyan-400 font-mono tracking-widest"
        >
          INITIALIZING INTELLIGENCE_
        </motion.div>
      </div>
    );
  }

  const topicStats = data?.topicStats || [];
  const snapshot = data?.snapshot || {};
  const recentSubmissions = data?.recentSubmissions || [];
  const insights = snapshot.insights || [];

  const radarData = topicStats.map(s => ({
    topic: s.topic,
    A: s.masteryScore,
    fullMark: 100,
  })).slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="page-shell dashboard-page"
    >
      <SectionHeader
        eyebrow="Intelligence Cockpit"
        title={`Welcome back, ${auth.user.profile.fullName || 'Architect'}`}
        description="Your skill DNA is evolving based on real-time ingestion logic."
        actions={
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => router.push('/dashboard/tracking')}>Manage Sync</Button>
            <Button variant="primary" onClick={logout}>Logout</Button>
          </div>
        }
      />

      {/* Insight Banner */}
      <AnimatePresence>
        {insights.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-8 overflow-hidden"
          >
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {insights.map((insight, i) => (
                <Card key={i} className="min-w-[300px] border-l-4" style={{ borderColor: insight.severity === 'warning' ? '#fbbf24' : '#22d3ee' }}>
                  <div className="flex gap-3">
                    {insight.severity === 'warning' ? <LuAlertTriangle className="text-yellow-400 shrink-0" /> : <LuInfo className="text-cyan-400 shrink-0" />}
                    <div>
                      <p className="text-xs opacity-50 uppercase tracking-tighter">{insight.topic || 'System'}</p>
                      <p className="text-sm font-medium">{insight.message}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <motion.div variants={itemVariants}>
          <Card className="stat-card group hover:border-cyan-500/50 transition-all duration-500">
            <div className="flex justify-between items-center mb-2">
              <p className="stat-label">Total Solved</p>
              <LuActivity size={20} className="text-cyan-400 group-hover:scale-125 transition-transform" />
            </div>
            <p className="stat-value text-4xl font-bold tracking-tight">{snapshot.totalSolved || 0}</p>
            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-cyan-400" />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="stat-card group hover:border-purple-500/50 transition-all duration-500">
            <div className="flex justify-between items-center mb-2">
              <p className="stat-label">Skill DNA</p>
              <LuBrainCircuit size={20} className="text-purple-400 group-hover:scale-125 transition-transform" />
            </div>
            <p className="stat-value text-xl font-semibold tracking-tight">{snapshot.skillDNA?.type || 'Analyzing...'}</p>
            <p className="text-[10px] opacity-40 mt-1">CONFIDENCE: {Math.round((snapshot.skillDNA?.confidence || 0) * 100)}%</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="stat-card group hover:border-emerald-500/50 transition-all duration-500">
            <div className="flex justify-between items-center mb-2">
              <p className="stat-label">Consistency</p>
              <LuZap size={20} className="text-emerald-400 group-hover:scale-125 transition-transform" />
            </div>
            <p className="stat-value text-4xl font-bold tracking-tight">{snapshot.consistencyScore || 0}%</p>
            <p className="text-[10px] opacity-40 mt-1">ACTIVE DAYS: {snapshot.activeDays || 0}</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="stat-card group hover:border-pink-500/50 transition-all duration-500">
            <div className="flex justify-between items-center mb-2">
              <p className="stat-label">Avg Mastery</p>
              <LuRotateCcw size={20} className="text-pink-400 group-hover:scale-125 transition-transform" />
            </div>
            <p className="stat-value text-4xl font-bold tracking-tight">
              {radarData.length > 0 ? Math.round(radarData.reduce((acc, d) => acc + d.A, 0) / radarData.length) : 0}%
            </p>
            <p className="text-[10px] opacity-40 mt-1">TOPIC STABILITY: {radarData.length > 0 ? 'HIGH' : 'LOW'}</p>
          </Card>
        </motion.div>
      </div>

      <div className="dashboard-main-grid grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full min-h-[450px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <LuBrainCircuit size={200} />
            </div>
            <h3 className="text-lg font-semibold mb-8 flex items-center gap-2">
               <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
               Mastery DNA Map
            </h3>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.6 }} />
                  <Radar
                    name="Mastery"
                    dataKey="A"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.3}
                    animationBegin={500}
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-white/10 rounded-xl">
                <LuZap size={48} className="mb-4" />
                <p>Connect profiles to generate DNA map</p>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="h-full p-8 flex flex-col">
            <h3 className="text-lg font-semibold mb-8 flex items-center gap-2">
               <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
               Recent Pulse
            </h3>
            <div className="flex flex-col gap-6 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
              {recentSubmissions.length > 0 ? recentSubmissions.map((sub, i) => (
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  key={i} 
                  className="flex justify-between items-start group"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[10px] group-hover:bg-cyan-500/20 transition-colors">
                      {sub.platform[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-cyan-400 transition-colors line-clamp-1">{sub.problemName}</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">{sub.language} • {new Date(sub.solvedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-cyan-400">UDI_{sub.udi}</p>
                    <LuCheckCircle size={12} className="ml-auto mt-1 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-20 opacity-20">
                   <p className="text-sm">No activity recorded</p>
                </div>
              )}
            </div>
            <Button 
              variant="secondary" 
              className="mt-auto w-full text-xs"
              onClick={() => router.push('/dashboard/tracking')}
            >
              Link More Platforms
            </Button>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}