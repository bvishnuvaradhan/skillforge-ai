"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/useAuth";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { RecommendationCard } from "../components/ui/RecommendationCard";
import { GreetingBlock } from "../components/dashboard/GreetingBlock";
import { DailyFocusCard } from "../components/dashboard/DailyFocusCard";
import { StatCard } from "../components/dashboard/StatCard";
import { RetentionHeatmap } from "../components/dashboard/RetentionHeatmap";
import { EmptyState } from "../components/dashboard/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from "recharts";
import { LuZap, LuActivity, LuBrainCircuit, LuRotateCcw, LuArrowRight } from "react-icons/lu";

export function DashboardScreen() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const recommendations = data?.dailyFocus || data?.recommendations || [];
  const hasProfiles = (data?.codingProfiles?.length || 0) > 0;
  const hasData = topicStats.length > 0;

  const radarData = topicStats.map(s => ({
    topic: s.topic,
    A: s.masteryScore,
    fullMark: 100,
  })).slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
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
      className="page-shell dashboard-page space-y-8"
      role="main"
      aria-label="Dashboard"
    >
      {/* TOP LAYER — Immediate Focus */}
      <div className="space-y-6">
        <motion.div variants={itemVariants}>
          <GreetingBlock
            userName={auth.user?.profile?.fullName || 'Learner'}
            momentumScore={snapshot.momentumScore || 0}
            streak={snapshot.currentStreak || snapshot.activeDays || 0}
            energyLevel={snapshot.energyLevel || 0}
          />
        </motion.div>

        {/* Daily Focus - Most important CTA */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">Your Focus Today</h2>
          {recommendations.length > 0 ? (
            <DailyFocusCard
              recommendations={recommendations}
              onStart={(rec) => {
                try { api.post(`/recommendations/${rec.id}/accept`); }
                catch (e) { console.error('accept failed', e); }
              }}
              onViewMore={() => router.push('/dashboard/recommendations')}
            />
          ) : (
            <EmptyState
              type="recommendations"
              onAction={() => router.push('/dashboard/tracking')}
            />
          )}
        </motion.div>

        {/* Momentum Summary */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">Your Momentum</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Learning Momentum"
              value={`${Math.round(snapshot.momentumScore || 0)}%`}
              icon={LuActivity}
              color="cyan"
              trend={(snapshot.momentumTrend || 0)}
              subtext="Based on activity & consistency"
            />
            <StatCard
              label="Current Streak"
              value={`${snapshot.currentStreak || snapshot.activeDays || 0}d`}
              icon={LuZap}
              color="emerald"
              subtext="Keep going!"
            />
            <StatCard
              label="Learning Energy"
              value={`${snapshot.energyLevel || 0}/10`}
              icon={LuActivity}
              color="purple"
              subtext="Session readiness"
            />
            <StatCard
              label="Avg Mastery"
              value={`${radarData.length > 0 ? Math.round(radarData.reduce((acc, d) => acc + d.A, 0) / radarData.length) : 0}%`}
              icon={LuRotateCcw}
              color="pink"
              subtext="Topic stability"
            />
          </div>
        </motion.div>
      </div>

      {/* MIDDLE LAYER — Adaptive Intelligence */}
      <div className="space-y-6">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Your Intelligence</h2>

        {!hasProfiles ? (
          <motion.div variants={itemVariants}>
            <EmptyState
              type="profiles"
              onAction={() => router.push('/dashboard/tracking')}
            />
          </motion.div>
        ) : !hasData ? (
          <motion.div variants={itemVariants}>
            <EmptyState
              type="data"
              onAction={() => router.push('/dashboard/tracking')}
            />
          </motion.div>
        ) : (
          <>
            {/* Skill DNA Radar */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <LuBrainCircuit size={200} />
                </div>
                <h3 className="text-lg font-semibold mb-8 flex items-center gap-2 relative z-10">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  Skill DNA Map
                </h3>
                <ResponsiveContainer width="100%" height={300}>
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
              </Card>

              {/* Skill DNA Type */}
              <Card className="p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">Your Learning Style</p>
                  <h3 className="text-2xl font-bold mb-2">{snapshot.skillDNA?.type || 'Analyzing...'}</h3>
                  <p className="text-xs opacity-60 leading-relaxed">
                    {snapshot.skillDNA?.description || 'Complete more problems to discover your unique learning archetype.'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((snapshot.skillDNA?.confidence || 0) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-purple-400 to-cyan-400"
                      />
                    </div>
                    <span className="text-xs opacity-50">{Math.round((snapshot.skillDNA?.confidence || 0) * 100)}%</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="mt-6 w-full text-xs"
                  onClick={() => router.push('/dashboard/skill-dna')}
                >
                  View Details <LuArrowRight size={12} />
                </Button>
              </Card>
            </motion.div>

            {/* Retention Heatmap */}
            <motion.div variants={itemVariants}>
              <RetentionHeatmap topicStats={topicStats} />
            </motion.div>
          </>
        )}
      </div>

      {/* BOTTOM LAYER — Long-Term Context */}
      <div className="space-y-6">
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Recent Activity</h2>

        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Latest Submissions
            </h3>
            {recentSubmissions.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {recentSubmissions.slice(0, 8).map((sub, i) => (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    key={i}
                    className="flex justify-between items-start p-3 rounded bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[10px] flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                        {sub.platform[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold group-hover:text-cyan-400 transition-colors truncate">{sub.problemName}</p>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest">{sub.language} • {new Date(sub.solvedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs font-mono text-cyan-400">UDI {sub.udi}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 opacity-40">
                <LuZap size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No submissions yet</p>
                <p className="text-xs mt-1">Link a coding profile to track your progress</p>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 text-xs"
                onClick={() => router.push('/dashboard/tracking')}
              >
                Manage Profiles
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-xs"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}