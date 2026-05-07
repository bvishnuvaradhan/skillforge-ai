"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { SectionHeader } from "../components/ui/SectionHeader";
import { LuGithub, LuCode2, LuTrophy, LuRefreshCw, LuCheckCircle2, LuAlertCircle } from "react-icons/lu";

export function TrackingScreen() {
  const { auth } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});

  const platforms = [
    { id: "github", name: "GitHub", icon: LuGithub, color: "var(--accent-primary)" },
    { id: "leetcode", name: "LeetCode", icon: LuCode2, color: "#FFA116" },
    { id: "codechef", name: "CodeChef", icon: LuTrophy, color: "#5B4638" },
  ];

  const fetchProfiles = async () => {
    try {
      const response = await api.get("/profiles");
      setProfiles(response.profiles);
    } catch (error) {
      console.error("Failed to fetch profiles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    const interval = setInterval(fetchProfiles, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLink = async (platform, username) => {
    try {
      await api.post("/profiles/link", { platform, username });
      fetchProfiles();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSync = async (platform) => {
    setSyncing(prev => ({ ...prev, [platform]: true }));
    try {
      await api.post(`/profiles/sync/${platform}`);
      fetchProfiles();
    } catch (error) {
      alert(error.message);
    } finally {
      setTimeout(() => setSyncing(prev => ({ ...prev, [platform]: false })), 2000);
    }
  };

  if (loading) return <div className="page-shell">Loading...</div>;

  return (
    <section className="page-shell tracking-page">
      <SectionHeader
        eyebrow="Data Ingestion"
        title="Coding Profiles"
        description="Connect your platforms to build your Skill DNA and track growth."
      />

      <div className="tracking-grid" style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
        {platforms.map((plt) => {
          const profile = profiles.find(p => p.platform === plt.id);
          return (
            <Card key={plt.id} className="platform-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <plt.icon size={32} style={{ color: plt.color }} />
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.25rem', fontWeight: '600' }}>{plt.name}</h3>
                    {profile && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', opacity: 0.8 }}>
                        <span>{profile.username}</span>
                        {profile.syncStatus === 'success' && <LuCheckCircle2 size={14} color="var(--success)" />}
                        {profile.syncStatus === 'failed' && <LuAlertCircle size={14} color="var(--error)" />}
                      </div>
                    )}
                  </div>
                </div>
                {profile && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => handleSync(plt.id)}
                    disabled={profile.syncStatus === 'syncing' || syncing[plt.id]}
                  >
                    <LuRefreshCw className={profile.syncStatus === 'syncing' || syncing[plt.id] ? "spin" : ""} style={{ marginRight: '0.5rem' }} />
                    {profile.syncStatus === 'syncing' ? 'Syncing...' : 'Refresh'}
                  </Button>
                )}
              </div>

              {!profile ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleLink(plt.id, e.target.username.value);
                }} style={{ display: 'flex', gap: '1rem' }}>
                  <Field 
                    name="username" 
                    placeholder={`${plt.name} Username`} 
                    required 
                    style={{ flex: 1 }}
                  />
                  <Button type="submit">Link Account</Button>
                </form>
              ) : (
                <div className="profile-stats-mini" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                  <div className="mini-stat">
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>Rating</p>
                    <p style={{ fontWeight: '600' }}>{profile.stats?.rating || '—'}</p>
                  </div>
                  <div className="mini-stat">
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>Global Rank</p>
                    <p style={{ fontWeight: '600' }}>{profile.stats?.globalRank || '—'}</p>
                  </div>
                  <div className="mini-stat">
                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.25rem' }}>Total Solved</p>
                    <p style={{ fontWeight: '600' }}>{profile.stats?.totalSolved || '—'}</p>
                  </div>
                </div>
              )}
              
              {profile?.error && (
                <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '1rem' }}>
                  Error: {profile.error}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
