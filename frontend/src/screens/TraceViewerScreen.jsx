"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LuGitBranch, LuShieldCheck, LuClock3, LuWorkflow } from "react-icons/lu";
import { useAuth } from "../context/useAuth";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

// Keep these imports referenced to avoid lint warnings
void motion; void LuGitBranch; void LuShieldCheck; void LuClock3; void LuWorkflow; void Button; void Card; void Field; void SectionHeader;
import { Field } from "../components/ui/Field";
import { SectionHeader } from "../components/ui/SectionHeader";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function TraceViewerScreen() {
  const router = useRouter();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [traces, setTraces] = useState([]);
  const [activeRunId, setActiveRunId] = useState("");
  const [runTrace, setRunTrace] = useState(null);
  const [lineage, setLineage] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [compactTimeline, setCompactTimeline] = useState(true);
  const [lineageRecommendationId, setLineageRecommendationId] = useState("");

  useEffect(() => {
    if (auth.ready && !auth.user) {
      router.replace("/login");
    }
  }, [auth.ready, auth.user, router]);

  useEffect(() => {
    async function fetchTraceOverview() {
      if (!auth.user?.id) return;
      setLoading(true);
      try {
        const result = await api.get(`/traces/user/${auth.user.id}?limit=40`);
        const list = result.traces || [];
        setTraces(list);
        if (list.length && !activeRunId) {
          setActiveRunId(list[0].runId);
        }
      } catch (error) {
        console.error("Trace overview fetch failed", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTraceOverview();
  }, [auth.user?.id, activeRunId]);

  useEffect(() => {
    async function fetchRunTrace() {
      if (!activeRunId) return;
      try {
        const result = await api.get(`/traces/arbitration/${activeRunId}`);
        setRunTrace(result);
      } catch (error) {
        console.error("Run trace fetch failed", error);
        setRunTrace(null);
      }
    }

    fetchRunTrace();
  }, [activeRunId]);

  const activeTraceSummary = useMemo(() => {
    if (!runTrace?.run) return null;
    const run = runTrace.run;
    return {
      runId: run.runId,
      latencyMs: run.latencyMs,
      winners: run.counts?.winners || 0,
      deferred: run.counts?.deferred || 0,
      suppressionRate: run.metrics?.suppressionRate || 0,
      createdAt: run.createdAt
    };
  }, [runTrace]);

  async function handleFetchLineage(event) {
    event.preventDefault();
    if (!lineageRecommendationId.trim()) return;

    try {
      const result = await api.get(
        `/observability/lineage?recommendationId=${encodeURIComponent(lineageRecommendationId.trim())}`
      );
      setLineage(result);
    } catch (error) {
      console.error("Lineage fetch failed", error);
      setLineage(null);
    }
  }

  if (!auth.ready || !auth.user || loading) {
    return <div className="page-shell flex items-center justify-center min-h-[55vh]">Loading traces...</div>;
  }

  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Observability"
        title="Recommendation Trace Viewer"
        description="Inspect arbitration runs, governance outcomes, and recommendation lineage."
        actions={<Button variant="secondary" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 xl:col-span-1">
          <h3 className="text-sm uppercase tracking-widest opacity-60 mb-4">Recent Arbitration Runs</h3>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {traces.map((trace) => (
              <button
                key={trace.runId}
                type="button"
                onClick={() => setActiveRunId(trace.runId)}
                className={`w-full text-left rounded-xl border p-3 transition ${
                  trace.runId === activeRunId ? "border-cyan-400/60 bg-cyan-400/10" : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-xs opacity-60">{formatDate(trace.createdAt)}</p>
                <p className="font-semibold mt-1">Run {trace.runId.slice(0, 10)}...</p>
                <p className="text-xs opacity-70 mt-1">
                  winners {trace.counts?.winners || 0} | deferred {trace.counts?.deferred || 0}
                </p>
              </button>
            ))}
          </div>
        </Card>

        <div className="xl:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LuWorkflow className="text-cyan-400" />
                Arbitration Summary
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <label className="flex items-center gap-2 text-sm opacity-80">
                  <input type="checkbox" checked={showTimeline} onChange={(e) => setShowTimeline(e.target.checked)} />
                  Show Timeline
                </label>
                {showTimeline && (
                  <label className="flex items-center gap-2 text-sm opacity-70">
                    <input type="checkbox" checked={compactTimeline} onChange={(e) => setCompactTimeline(e.target.checked)} />
                    Compact
                  </label>
                )}
              </div>
              {activeTraceSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p><LuClock3 className="inline mr-2" />Latency: {activeTraceSummary.latencyMs} ms</p>
                  <p><LuGitBranch className="inline mr-2" />Suppression: {activeTraceSummary.suppressionRate}%</p>
                  <p>Winners: {activeTraceSummary.winners}</p>
                  <p>Deferred: {activeTraceSummary.deferred}</p>
                </div>
              ) : (
                <p className="opacity-70">Select a run to inspect details.</p>
              )}
              {showTimeline && runTrace?.recommendationTraces && (
                <div className="mt-4 border-t pt-4 space-y-2 text-sm max-h-48 overflow-y-auto">
                  {(runTrace.recommendationTraces || []).slice(0, 50).map((t) => (
                    <div key={t._id} className={`flex items-center justify-between ${compactTimeline ? 'py-1' : 'py-2'}`}>
                      <div className="flex-1">
                        <div className="font-medium">{t.stage} · {t.outcome}</div>
                        {!compactTimeline && <div className="opacity-70 text-xs">{t.reason || 'no-reason'}</div>}
                      </div>
                      <div className="text-xs opacity-60 ml-4">{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <LuShieldCheck className="text-violet-400" />
              Governance Events
            </h3>
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {(runTrace?.governanceAudit || []).slice(0, 20).map((event) => (
                <div key={event._id} className="border border-white/10 rounded-lg p-3 text-sm bg-white/5">
                  <p className="font-medium">{event.action} · {event.topic || "unknown"}</p>
                  <p className="opacity-70 text-xs">{event.rule} | {event.reason}</p>
                </div>
              ))}
              {!runTrace?.governanceAudit?.length && <p className="opacity-70 text-sm">No governance events for this run.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Lineage Lookup</h3>
            <form onSubmit={handleFetchLineage} className="flex flex-col md:flex-row gap-3 items-end">
              <Field label="Recommendation Id" className="flex-1">
                <input
                  className="sf-input"
                  value={lineageRecommendationId}
                  onChange={(event) => setLineageRecommendationId(event.target.value)}
                  placeholder="Paste recommendation id"
                  required
                />
              </Field>
              <Button variant="primary" type="submit">Fetch Lineage</Button>
            </form>

            {lineage && (
              <div className="mt-5 space-y-2 max-h-[260px] overflow-y-auto">
                {(lineage.lineage || []).map((step, index) => (
                  <div key={`${step.at}-${index}`} className="rounded-lg border border-white/10 p-3 bg-white/5 text-sm">
                    <p className="font-medium">{step.stage} · {step.outcome}</p>
                    <p className="opacity-70">{step.reason}</p>
                    <p className="text-xs opacity-60">signal: {step.winningSignal || "n/a"} | score: {step.finalPriorityScore ?? "n/a"}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
