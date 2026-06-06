"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/useAuth";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { RecommendationCard } from "../components/ui/RecommendationCard";
import { EmptyState } from "../components/dashboard/EmptyState";
import { SkeletonLoader } from "../components/ui/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuZap,
  LuFlame,
  LuTrendingUp,
  LuBrainCircuit,
  LuActivity,
  LuArrowRight,
  LuAward
} from "react-icons/lu";

// Defensive references to keep linter happy for unused default variables
void EmptyState;
void Button; void Card; void RecommendationCard; void SkeletonLoader; void motion; void AnimatePresence;
void LuZap; void LuFlame; void LuTrendingUp; void LuBrainCircuit; void LuActivity; void LuArrowRight; void LuAward;

export function DashboardScreen() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashboardRes, recsRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/recommendations").catch(() => ({ recommendations: [] }))
      ]);

      setData({
        ...dashboardRes,
        recommendations: recsRes?.recommendations || []
      });
    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.ready && !auth.user) {
      router.replace("/login");
    }
  }, [auth.ready, router, auth.user]);

  useEffect(() => {
    if (auth.user) {
      fetchData();
    }
  }, [auth.user]);

  const handleAcceptRec = async (recId) => {
    try {
      await api.post(`/recommendations/${recId}/accept`);
      await fetchData();
    } catch (err) {
      console.error("Failed to accept recommendation:", err);
    }
  };

  const handleSnoozeRec = async (recId) => {
    try {
      await api.post(`/recommendations/${recId}/reject`, { reason: "deferred" });
      await fetchData();
    } catch (err) {
      console.error("Failed to snooze recommendation:", err);
    }
  };

  const handleCompleteRec = async (recId) => {
    try {
      await api.post(`/recommendations/${recId}/complete`);
      await fetchData();
    } catch (err) {
      console.error("Failed to complete recommendation:", err);
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (!auth.ready || !auth.user || loading) {
    return (
      <div className="page-shell dashboard-page space-y-8 pb-12">
        <SkeletonLoader type="hero" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse" />
            <SkeletonLoader type="recommendation" count={2} />
          </div>
          <div className="space-y-6">
            <SkeletonLoader type="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  const topicStats = data?.topicStats || [];
  const snapshot = data?.snapshot || {};
  const recentSubmissions = data?.recentSubmissions || [];
  const recommendations = data?.recommendations || [];

  const streak = snapshot.currentStreak || snapshot.activeDays || 0;
  const readinessScore = snapshot.readinessScore || (topicStats.length > 0 
    ? Math.round(topicStats.reduce((sum, t) => sum + (t.masteryScore || 0), 0) / topicStats.length) 
    : 82);
  const momentumTrend = snapshot.momentumTrend || 0;
  const energyLevel = snapshot.energyLevel || 8;

  const masteredCount = topicStats.filter(t => (t.masteryScore || 0) >= 80).length;
  const totalCount = topicStats.length || 1;
  const progressPercent = topicStats.length > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  const memoryHealth = topicStats.length > 0 
    ? Math.round(topicStats.reduce((sum, t) => sum + (t.retentionScore || 0) * 100, 0) / topicStats.length)
    : 84;

  const criticalDecayTopics = topicStats.filter(t => (t.retentionScore || 0) < 0.6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="page-shell dashboard-page space-y-8 pb-12"
      role="main"
      aria-label="Dashboard"
    >
      {/* 1. HERO SECTION & DAILY FOCUS (Primary) */}
      <motion.div variants={itemVariants} className="w-full">
        <Card depth="level2" className="p-6 relative overflow-hidden bg-gradient-to-r from-slate-900/40 via-indigo-950/20 to-slate-900/40 border border-white/10 rounded-3xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  {getGreeting()}, {auth.user?.profile?.fullName || "Learner"} 👋
                </h1>
                <p className="text-xs opacity-50 mt-1 uppercase tracking-wider font-mono">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Dynamic Status Badges Row */}
              <div className="flex flex-wrap gap-2.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                  <LuFlame className="animate-pulse" size={14} />
                  <span>{streak} Day Streak</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                  <LuZap size={14} />
                  <span>{readinessScore}% Readiness</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                  <LuTrendingUp size={14} />
                  <span>{momentumTrend >= 0 ? "+" : ""}{Math.round(momentumTrend)}% Momentum</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                  <LuActivity size={14} />
                  <span>Energy: {energyLevel}/10</span>
                </div>
              </div>
            </div>

            {/* Daily Focus Panel */}
            <div className="bg-slate-950/45 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-cyan-400 font-bold font-mono">🎯 Daily Focus Areas</h3>
                  <p className="text-[11px] opacity-50 mt-0.5">Start a recommended task below to maximize your momentum today.</p>
                </div>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full font-mono uppercase tracking-widest">
                  System Ready
                </span>
              </div>

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.slice(0, 3).map((rec, idx) => (
                    <div 
                      key={rec._id || rec.id || idx} 
                      className="flex flex-col justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/35 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-cyan-300/80 tracking-wide font-mono uppercase bg-cyan-900/30 px-2 py-0.5 rounded">
                            {rec.impact || "High Impact"}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors truncate mb-1">
                          {rec.title || rec.action || "Practice: Topic"}
                        </h4>
                        <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">
                          {rec.whyThisNow || rec.explanation || "Recommended based on recent activity."}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] opacity-40 font-mono">Est: {rec.effort || "20m"}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-cyan-400 hover:text-white group-hover:translate-x-1 transition-transform p-0 flex items-center gap-1"
                          onClick={() => handleAcceptRec(rec._id || rec.id)}
                        >
                          Start Now <LuArrowRight size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm opacity-50">No focus recommendations active. Link a profile to begin generating daily actions.</p>
                  <Button variant="secondary" className="mt-3 text-xs" onClick={() => router.push('/dashboard/tracking')}>
                    Manage Profiles
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 2. MAIN LAYOUT: RECOMMENDATIONS & SNAPSHOTS (Secondary & Tertiary) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation Feed (Secondary) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">✦ Active Recommendation Feed</h2>
              <p className="text-xs opacity-50 mt-1">Capped at 5 active suggestions to maintain cognitive clarity</p>
            </div>
            <Button variant="ghost" className="text-xs text-cyan-400 hover:underline" onClick={() => router.push('/dashboard/explainability')}>
              Explain Decisions
            </Button>
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <RecommendationCard
                    key={rec._id || rec.id || idx}
                    rec={rec}
                    onAccept={() => handleAcceptRec(rec._id || rec.id)}
                    onSnooze={() => handleSnoozeRec(rec._id || rec.id)}
                    onComplete={() => handleCompleteRec(rec._id || rec.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState
              type="recommendations"
              onAction={() => router.push('/dashboard/tracking')}
            />
          )}
        </div>

        {/* Snapshots Sidebar (Tertiary) */}
        <div className="space-y-6">
          {/* Roadmap Milestones Preview */}
          <Card depth="level2" className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <LuAward className="text-cyan-400" size={16} />
              Roadmap Milestones
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="opacity-60">Syllabus Completion</span>
                  <span className="font-mono text-cyan-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-medium">Mastered Topics</span>
                  </div>
                  <span className="font-bold text-white">{masteredCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-medium">Developing Topics</span>
                  </div>
                  <span className="font-bold text-white">{topicStats.filter(t => (t.masteryScore || 0) < 80 && (t.masteryScore || 0) >= 30).length}</span>
                </div>
              </div>

              <Button 
                variant="secondary" 
                className="w-full text-xs"
                onClick={() => router.push('/dashboard/learning-journey')}
              >
                Open Full Roadmap <LuArrowRight size={12} className="ml-1" />
              </Button>
            </div>
          </Card>

          {/* DNA Snapshot */}
          <Card depth="level2" className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <LuBrainCircuit className="text-purple-400" size={16} />
                Skill DNA Archetype
              </h3>
              
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 mb-4">
                <p className="text-xs uppercase tracking-wider text-purple-400 font-bold font-mono">Learning Style</p>
                <h4 className="text-lg font-bold text-white mt-1">{snapshot.skillDNA?.type || 'Consistent Learner'}</h4>
                <p className="text-xs opacity-60 mt-2 leading-relaxed">
                  {snapshot.skillDNA?.description || 'Your learning archetype reflects high practice consistency and deep traversal of fundamental concepts.'}
                </p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: `${Math.round((snapshot.skillDNA?.confidence || 0.8) * 100)}%` }} />
                </div>
                <span className="text-[10px] font-mono opacity-50">{Math.round((snapshot.skillDNA?.confidence || 0.8) * 100)}% Match</span>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="w-full text-xs"
              onClick={() => router.push('/dashboard/skill-dna')}
            >
              Analyze Skill DNA <LuArrowRight size={12} className="ml-1" />
            </Button>
          </Card>

          {/* Retention Snapshot */}
          <Card depth="level2" className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <LuActivity className="text-emerald-400" size={16} />
              Memory Health
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-400/30 flex items-center justify-center font-mono font-bold text-lg text-emerald-400">
                  {memoryHealth}%
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Overall Memory Health</p>
                  <p className="text-[10px] opacity-50">Estimated retention across all topics</p>
                </div>
              </div>

              {/* Critical Decay Warnings */}
              {criticalDecayTopics.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold font-mono">⚠️ Critical Decay Alerts</p>
                  {criticalDecayTopics.slice(0, 2).map((topic, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-red-500/5 border border-red-500/10">
                      <span className="text-white opacity-90 truncate max-w-[120px]">{topic.topic}</span>
                      <span className="text-red-400 font-mono font-semibold">Decayed to {Math.round((topic.retentionScore || 0) * 100)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-2 rounded bg-emerald-500/5 text-[11px] text-emerald-400">
                  ✓ Memory retention looks stable. No critical decay.
                </div>
              )}

              <Button 
                variant="secondary" 
                className="w-full text-xs"
                onClick={() => router.push('/dashboard/memory')}
              >
                Access Memory Lab <LuArrowRight size={12} className="ml-1" />
              </Button>
            </div>
          </Card>

          {/* Latest Submissions List */}
          <Card depth="level2" className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Latest Activity</h3>
            {recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.slice(0, 3).map((sub, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded bg-white/5">
                    <div>
                      <p className="font-semibold text-white truncate max-w-[150px]">{sub.problemName}</p>
                      <p className="text-[9px] opacity-40 uppercase">{sub.platform} • {sub.language}</p>
                    </div>
                    <span className="text-cyan-400 font-mono">UDI {sub.udi}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs opacity-40 text-center py-4">No submissions yet.</p>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="flex-1 text-xs" onClick={() => router.push("/dashboard/tracking")}>
                Profiles
              </Button>
              <Button variant="ghost" className="flex-1 text-xs" onClick={logout}>
                Logout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.section>
  );
}