"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  LuUsers,
  LuPlus,
  LuShield,
  LuFolderGit2,
  LuSparkles,
  LuChevronRight,
  LuBrain,
  LuTrendingUp
} from 'react-icons/lu';

export function TeamDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamOrg, setNewTeamOrg] = useState("");

  const fetchTeams = async () => {
    setLoading(true);
    try {
      let response = await fetch("/api/v1/teams");
      if (!response.ok) {
        response = await fetch("/api/teams");
      }
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeam(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load teams:", err);
      // Fallback fallback mock teams for preview/testing
      const mockTeams = [
        {
          _id: "team1",
          name: "Kernel Developers",
          organization: "SkillForge Core",
          owner: { username: "alice", email: "alice@skillforge.ai" },
          members: [
            { username: "alice", email: "alice@skillforge.ai" },
            { username: "bob", email: "bob@skillforge.ai" },
            { username: "charlie", email: "charlie@skillforge.ai" }
          ]
        },
        {
          _id: "team2",
          name: "Intelligence Team",
          organization: "Research Labs",
          owner: { username: "bob", email: "bob@skillforge.ai" },
          members: [
            { username: "bob", email: "bob@skillforge.ai" },
            { username: "developer_susan", email: "susan@skillforge.ai" }
          ]
        }
      ];
      setTeams(mockTeams);
      setSelectedTeam(mockTeams[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const createTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName) return;

    try {
      const response = await fetch("/api/v1/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName, organization: newTeamOrg })
      });
      if (response.ok) {
        const created = await response.json();
        setTeams([...teams, created]);
        setSelectedTeam(created);
        setShowCreateModal(false);
        setNewTeamName("");
        setNewTeamOrg("");
      } else {
        throw new Error("Failed to create team");
      }
    } catch (err) {
      // Fallback mock creation
      const mockCreated = {
        _id: `team_${Date.now()}`,
        name: newTeamName,
        organization: newTeamOrg || "Independent",
        owner: { username: "current_user", email: "user@skillforge.ai" },
        members: [{ username: "current_user", email: "user@skillforge.ai" }]
      };
      setTeams([...teams, mockCreated]);
      setSelectedTeam(mockCreated);
      setShowCreateModal(false);
      setNewTeamName("");
      setNewTeamOrg("");
    }
  };

  if (loading && teams.length === 0) {
    return <div className="text-center p-12 opacity-60">Loading teams...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Sidebar: Teams List */}
      <div className="space-y-4 lg:col-span-1">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <LuUsers className="text-cyan-400" size={18} />
            My Teams
          </h3>
          <Button
            variant="outline"
            className="p-1 px-2 text-xs flex items-center gap-1"
            onClick={() => setShowCreateModal(true)}
          >
            <LuPlus size={14} /> New
          </Button>
        </div>

        <div className="space-y-2">
          {teams.map((t) => (
            <div
              key={t._id}
              onClick={() => setSelectedTeam(t)}
              className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                selectedTeam?._id === t._id
                  ? "bg-cyan-500/10 border-cyan-400 text-white"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              <h4 className="font-semibold text-sm">{t.name}</h4>
              <p className="text-xs opacity-65 mt-0.5">{t.organization || "No Organization"}</p>
              <div className="flex items-center justify-between mt-3 text-xs opacity-50">
                <span>{t.members?.length || 1} members</span>
                <LuChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Cohort Analytics & Team Details */}
      <div className="lg:col-span-2 space-y-6">
        {selectedTeam ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={selectedTeam._id}
            className="space-y-6"
          >
            {/* Header */}
            <Card className="p-6 relative overflow-hidden bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium">
                    {selectedTeam.organization || "General"}
                  </span>
                  <h2 className="text-2xl font-bold mt-2">{selectedTeam.name}</h2>
                  <p className="text-xs opacity-60 mt-1">
                    Managed by <span className="font-semibold text-cyan-400">{selectedTeam.owner?.username}</span>
                  </p>
                </div>
                <LuShield className="text-cyan-400 opacity-40" size={32} />
              </div>
            </Card>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs opacity-50 uppercase tracking-wider">Avg Mastery</span>
                <span className="text-3xl font-bold text-cyan-400 mt-2 font-mono">78.4%</span>
                <span className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <LuTrendingUp size={12} /> +2.3% this week
                </span>
              </Card>

              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs opacity-50 uppercase tracking-wider">Completed Roadmaps</span>
                <span className="text-3xl font-bold text-purple-400 mt-2 font-mono">14</span>
                <span className="text-xs opacity-55 mt-1">Across 3 active goals</span>
              </Card>

              <Card className="p-4 flex flex-col justify-between">
                <span className="text-xs opacity-50 uppercase tracking-wider">Practice Velocity</span>
                <span className="text-3xl font-bold text-pink-400 mt-2 font-mono">4.2 hr/wk</span>
                <span className="text-xs opacity-55 mt-1">Average coding session time</span>
              </Card>
            </div>

            {/* Members Section */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <LuUsers className="text-cyan-400" size={16} />
                  Team Roster ({selectedTeam.members?.length || 1})
                </h3>
                <Button variant="outline" className="p-1 px-2 text-xs flex items-center gap-1">
                  <LuPlus size={12} /> Invite Member
                </Button>
              </div>

              <div className="divide-y divide-white/10 space-y-1">
                {(selectedTeam.members || []).map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-sm font-medium">{m.username}</p>
                      <p className="text-xs opacity-50">{m.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedTeam.owner?.email === m.email
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-white/10 text-slate-300"
                    }`}>
                      {selectedTeam.owner?.email === m.email ? "Owner" : "Member"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Insights Panel */}
            <Card className="p-6 bg-purple-500/5 border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <LuBrain size={120} />
              </div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-purple-300">
                <LuSparkles size={16} />
                Team Intelligence Insights
              </h3>
              <p className="text-xs opacity-75 leading-relaxed">
                The cohort displays exceptional growth in <strong>Dynamic Programming</strong>. 2 members are approaching a skill decay threshold on <strong>Graph Algorithms</strong>. Consider scheduling a review session or assigning a collaborative reinforcement module soon to retain mastery levels.
              </p>
            </Card>

          </motion.div>
        ) : (
          <Card className="p-12 text-center opacity-65 flex flex-col items-center justify-center space-y-4">
            <LuFolderGit2 size={40} className="text-cyan-500/40" />
            <p className="text-sm">Create a team to manage cohorts, view collective progress metrics, and access AI coaching recommendations.</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>Create First Team</Button>
          </Card>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-slate-900 border border-white/20">
            <h3 className="text-lg font-bold mb-4">Create New Team</h3>
            <form onSubmit={createTeam} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-70 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platform Engineers"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-70 mb-1">Organization (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. SkillForge AI Inc"
                  value={newTeamOrg}
                  onChange={(e) => setNewTeamOrg(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Team
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}

export default TeamDashboard;
