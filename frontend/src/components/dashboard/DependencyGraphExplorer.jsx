"use client";
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LuZoomIn, LuZoomOut, LuRefreshCw } from 'react-icons/lu';

// Defensive refs for imports and internal state used to silence linter warnings
void motion; void Card; void Button; void LuZoomIn; void LuZoomOut; void LuRefreshCw;

const getNodeBorder = (status, mastery) => {
  if (mastery >= 0.8 || status === 'mastered') return 'border-emerald-500/50 shadow-emerald-500/10 text-emerald-400';
  if (mastery <= 0.4 || status === 'critical') return 'border-rose-500/60 shadow-rose-500/25 text-rose-400 animate-pulse';
  if (mastery <= 0.6 || status === 'weak') return 'border-amber-500/50 shadow-amber-500/10 text-amber-400';
  return 'border-cyan-500/30 text-cyan-400';
};

export function DependencyGraphExplorer({ topics = [], onSelectTopic }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Keep these referenced so they aren't reported as unused (keeps API stable)
  void onSelectTopic; void panX; void panY;

  const mockTopics = [
    { id: '1', name: 'Arrays & Strings', mastery: 0.85, status: 'mastered', x: 100, y: 50 },
    { id: '2', name: 'Sorting', mastery: 0.7, status: 'developing', x: 300, y: 50, deps: ['1'] },
    { id: '3', name: 'Binary Search', mastery: 0.75, status: 'developing', x: 150, y: 150, deps: ['1', '2'] },
    { id: '4', name: 'Recursion', mastery: 0.65, status: 'developing', x: 350, y: 150, deps: ['1'] },
    { id: '5', name: 'Dynamic Programming', mastery: 0.45, status: 'recommended', x: 250, y: 250, deps: ['3', '4'], isRecommended: true },
    { id: '6', name: 'Graphs', mastery: 0.55, status: 'available', x: 450, y: 250, deps: ['3', '4'] },
    { id: '7', name: 'BFS/DFS', mastery: 0.6, status: 'developing', x: 450, y: 150, deps: ['4'] },
  ];

  const graphData = topics.length > 0 ? topics : mockTopics;

  // Build edges from dependencies
  const edges = useMemo(() => {
    const edgeList = [];
    graphData.forEach(topic => {
      (topic.deps || []).forEach(depId => {
        const target = graphData.find(t => t.id === depId);
        if (target) {
          edgeList.push({ from: depId, to: topic.id, type: 'dependency' });
        }
      });
    });
    return edgeList;
  }, [graphData]);

  const selectedNodeData = selectedNode ? graphData.find(t => t.id === selectedNode) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Controls */}
      <Card className="p-4 flex items-center justify-between">
        <p className="text-sm opacity-70">Skill Dependency Graph</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-2 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-cyan-400"
            title="Zoom out"
          >
            <LuZoomOut size={18} />
          </button>
          <span className="text-xs opacity-50 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="p-2 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-cyan-400"
            title="Zoom in"
          >
            <LuZoomIn size={18} />
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
            className="p-2 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-cyan-400"
            title="Reset view"
          >
            <LuRefreshCw size={18} />
          </button>
        </div>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Graph */}
        <Card className="lg:col-span-3 p-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 overflow-hidden" style={{ minHeight: '500px' }}>
          <svg className="w-full h-full" viewBox={`0 0 600 400`} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', cursor: 'move' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="rgba(148, 163, 184, 0.3)" />
              </marker>
              <marker id="arrowheadHighlight" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="rgba(34, 211, 238, 0.6)" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((edge, idx) => {
              const from = graphData.find(t => t.id === edge.from);
              const to = graphData.find(t => t.id === edge.to);
              if (!from || !to) return null;

              const isSelected = selectedNode === edge.to || selectedNode === edge.from;
              const strokeColor = isSelected ? 'rgba(34, 211, 238, 0.6)' : 'rgba(148, 163, 184, 0.2)';
              const markerUrl = isSelected ? 'url(#arrowheadHighlight)' : 'url(#arrowhead)';

              return (
                <line
                  key={idx}
                  x1={from.x + 65}
                  y1={from.y + 37.5}
                  x2={to.x + 65}
                  y2={to.y + 37.5}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 2 : 1}
                  markerEnd={markerUrl}
                  className="transition-all"
                />
              );
            })}

            {/* Nodes */}
            {graphData.map((topic, idx) => {
              const isSelected = selectedNode === topic.id;
              const borderClass = getNodeBorder(topic.status, topic.mastery);
              const masteryPct = Math.round((topic.mastery || 0) * 100);

              return (
                <foreignObject
                  key={`${topic.id}-${idx}`}
                  x={topic.x}
                  y={topic.y}
                  width="130"
                  height="75"
                  onClick={() => setSelectedNode(isSelected ? null : topic.id)}
                  className="cursor-pointer"
                >
                  <div
                    className={`p-2.5 rounded-xl border flex flex-col justify-between h-full select-none transition-all duration-300 ${
                      isSelected
                        ? 'bg-slate-900/80 ring-2 ring-cyan-400 border-cyan-400 shadow-lg scale-102'
                        : 'bg-slate-900/50 backdrop-blur-md shadow-xs hover:border-white/30'
                    } ${borderClass}`}
                  >
                    <div>
                      <div className="text-[10px] font-bold text-white/90 truncate leading-tight">{topic.name}</div>
                      {topic.isRecommended && (
                        <span className="text-[7px] px-1 bg-amber-500/30 text-amber-300 rounded font-mono">REC</span>
                      )}
                    </div>

                    <div className="flex justify-between items-baseline mt-1 border-t border-white/5 pt-1.5">
                      <span className="text-[8px] opacity-60 capitalize truncate max-w-[60px]">{topic.status || 'available'}</span>
                      <span className="text-xs font-black font-mono">{masteryPct}%</span>
                    </div>
                  </div>
                </foreignObject>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 text-xs space-y-1 bg-black/50 p-3 rounded border border-white/10">
            <div className="flex items-center gap-2 opacity-70">
              <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
              <span>Mastered</span>
            </div>
            <div className="flex items-center gap-2 opacity-70">
              <div className="w-3 h-3 rounded-full bg-cyan-500/30 border border-cyan-500/50" />
              <span>Developing</span>
            </div>
            <div className="flex items-center gap-2 opacity-70">
              <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50 animate-pulse" />
              <span>Recommended</span>
            </div>
          </div>
        </Card>

        {/* Details Panel */}
        {selectedNodeData && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="p-5 bg-gradient-to-b from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold">Selected Topic</span>
                  <h3 className="font-semibold text-lg text-white mt-0.5">{selectedNodeData.name}</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs opacity-50 uppercase tracking-wider mb-1">Mastery Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                          style={{ width: `${selectedNodeData.mastery * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-cyan-400 font-mono">{Math.round(selectedNodeData.mastery * 100)}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs opacity-50 uppercase tracking-wider mb-1">Cognitive Retention</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                          style={{ width: `${Math.round((selectedNodeData.retention || selectedNodeData.mastery * 0.9) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-emerald-400 font-mono">
                        {Math.round((selectedNodeData.retention || selectedNodeData.mastery * 0.9) * 100)}%
                      </span>
                    </div>
                  </div>

                  {selectedNodeData.deps?.length > 0 && (
                    <div>
                      <p className="text-xs opacity-50 uppercase tracking-wider mb-2">Prerequisites</p>
                      <div className="space-y-1">
                        {selectedNodeData.deps.map((depId) => {
                          const dep = graphData.find(t => t.id === depId);
                          return (
                            <div key={depId} className="text-xs bg-white/5 p-2 rounded opacity-75 border border-white/5">
                              {dep?.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-[10px] uppercase tracking-wider text-purple-300 font-semibold mb-1">AI Recommendation</p>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {selectedNodeData.mastery >= 0.8
                      ? `You've achieved high mastery! Consider reviewing related concepts to maintain stability.`
                      : `You may benefit from practicing ${selectedNodeData.name} fundamentals this week to solidify your foundations.`
                    }
                  </p>
                </div>

                <Button variant="secondary" className="w-full text-xs">
                  Accept Practice
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <Card className="p-4 text-xs opacity-60 bg-white/5">
        <p>Click on a topic to see details • Lines show prerequisites → dependencies • Dashed rings indicate recommended topics</p>
      </Card>
    </motion.div>
  );
}

export default DependencyGraphExplorer;
