const crypto = require("crypto");
const TopicDependencyModel = require("../../models/TopicDependency");
const DependencyGraphModel = require("../../models/DependencyGraph");
const DependencyEdgeModel = require("../../models/DependencyEdge");

const STATIC_GRAPH = [
  {
    topic: "Arrays",
    role: "backend",
    roles: ["backend", "fullstack"],
    suggestedPosition: 1,
    isMilestone: true,
    topicCategory: "fundamentals",
    difficulty: 3,
    prerequisites: [],
    unlocksTopics: [
      { topic: "Linked Lists", spilloverFactor: 0.2, confidence: 70 },
      { topic: "Trees", spilloverFactor: 0.2, confidence: 75 }
    ]
  },
  {
    topic: "Linked Lists",
    role: "backend",
    roles: ["backend", "fullstack"],
    suggestedPosition: 2,
    isMilestone: true,
    topicCategory: "fundamentals",
    difficulty: 4,
    prerequisites: [
      { topic: "Arrays", strength: 0.7, dependencyType: "foundational", minMasteryRequired: 60, confidence: 75 }
    ],
    unlocksTopics: [
      { topic: "Stacks", spilloverFactor: 0.2, confidence: 70 },
      { topic: "Queues", spilloverFactor: 0.2, confidence: 70 }
    ]
  },
  {
    topic: "Stacks",
    role: "backend",
    roles: ["backend", "fullstack"],
    suggestedPosition: 3,
    isMilestone: false,
    topicCategory: "fundamentals",
    difficulty: 4,
    prerequisites: [
      { topic: "Linked Lists", strength: 0.6, dependencyType: "foundational", minMasteryRequired: 60, confidence: 70 }
    ],
    unlocksTopics: [{ topic: "Trees", spilloverFactor: 0.25, confidence: 75 }]
  },
  {
    topic: "Queues",
    role: "backend",
    roles: ["backend", "fullstack"],
    suggestedPosition: 4,
    isMilestone: false,
    topicCategory: "fundamentals",
    difficulty: 4,
    prerequisites: [
      { topic: "Linked Lists", strength: 0.6, dependencyType: "foundational", minMasteryRequired: 60, confidence: 70 }
    ],
    unlocksTopics: [{ topic: "Graphs", spilloverFactor: 0.2, confidence: 72 }]
  },
  {
    topic: "Trees",
    role: "backend",
    roles: ["backend", "fullstack"],
    suggestedPosition: 5,
    isMilestone: true,
    topicCategory: "intermediate",
    difficulty: 6,
    prerequisites: [
      { topic: "Arrays", strength: 0.8, dependencyType: "foundational", minMasteryRequired: 65, confidence: 80 },
      { topic: "Stacks", strength: 0.6, dependencyType: "reinforcing", minMasteryRequired: 60, confidence: 75 }
    ],
    unlocksTopics: [
      { topic: "Graphs", spilloverFactor: 0.3, confidence: 85 },
      { topic: "Heaps", spilloverFactor: 0.25, confidence: 75 }
    ]
  },
  {
    topic: "Graphs",
    role: "backend",
    roles: ["backend", "fullstack"],
    suggestedPosition: 6,
    isMilestone: true,
    isAdvanced: true,
    topicCategory: "advanced",
    difficulty: 7,
    prerequisites: [
      { topic: "Trees", strength: 0.85, dependencyType: "foundational", minMasteryRequired: 70, confidence: 85 },
      { topic: "Queues", strength: 0.6, dependencyType: "reinforcing", minMasteryRequired: 60, confidence: 72 }
    ],
    unlocksTopics: [{ topic: "Advanced Graphs", spilloverFactor: 0.3, confidence: 80 }]
  },
  {
    topic: "Advanced Graphs",
    role: "backend",
    roles: ["backend", "fullstack"],
    suggestedPosition: 7,
    isMilestone: false,
    isAdvanced: true,
    topicCategory: "specialized",
    difficulty: 9,
    prerequisites: [
      { topic: "Graphs", strength: 0.9, dependencyType: "foundational", minMasteryRequired: 75, confidence: 85 }
    ],
    unlocksTopics: []
  },
  {
    topic: "JavaScript Fundamentals",
    role: "frontend",
    roles: ["frontend", "fullstack"],
    suggestedPosition: 1,
    isMilestone: true,
    topicCategory: "fundamentals",
    difficulty: 3,
    prerequisites: [],
    unlocksTopics: [
      { topic: "DOM", spilloverFactor: 0.25, confidence: 78 },
      { topic: "Async JavaScript", spilloverFactor: 0.25, confidence: 75 }
    ]
  },
  {
    topic: "DOM",
    role: "frontend",
    roles: ["frontend", "fullstack"],
    suggestedPosition: 2,
    isMilestone: true,
    topicCategory: "fundamentals",
    difficulty: 4,
    prerequisites: [
      { topic: "JavaScript Fundamentals", strength: 0.8, dependencyType: "foundational", minMasteryRequired: 60, confidence: 78 }
    ],
    unlocksTopics: [{ topic: "Events", spilloverFactor: 0.25, confidence: 76 }]
  },
  {
    topic: "Events",
    role: "frontend",
    roles: ["frontend", "fullstack"],
    suggestedPosition: 3,
    isMilestone: false,
    topicCategory: "intermediate",
    difficulty: 5,
    prerequisites: [
      { topic: "DOM", strength: 0.75, dependencyType: "foundational", minMasteryRequired: 60, confidence: 76 }
    ],
    unlocksTopics: [{ topic: "React Fundamentals", spilloverFactor: 0.2, confidence: 70 }]
  },
  {
    topic: "Async JavaScript",
    role: "frontend",
    roles: ["frontend", "fullstack"],
    suggestedPosition: 4,
    isMilestone: false,
    topicCategory: "intermediate",
    difficulty: 6,
    prerequisites: [
      { topic: "JavaScript Fundamentals", strength: 0.8, dependencyType: "foundational", minMasteryRequired: 65, confidence: 75 }
    ],
    unlocksTopics: [{ topic: "React Fundamentals", spilloverFactor: 0.2, confidence: 72 }]
  },
  {
    topic: "React Fundamentals",
    role: "frontend",
    roles: ["frontend", "fullstack"],
    suggestedPosition: 5,
    isMilestone: true,
    isAdvanced: true,
    topicCategory: "advanced",
    difficulty: 7,
    prerequisites: [
      { topic: "Events", strength: 0.65, dependencyType: "reinforcing", minMasteryRequired: 60, confidence: 70 },
      { topic: "Async JavaScript", strength: 0.7, dependencyType: "foundational", minMasteryRequired: 65, confidence: 75 }
    ],
    unlocksTopics: []
  }
];

function detectCycle(nodes) {
  const adjacency = new Map();
  for (const node of nodes) {
    adjacency.set(node.topic, (node.unlocksTopics || []).map((edge) => edge.topic));
  }

  const visiting = new Set();
  const visited = new Set();

  function dfs(topic) {
    if (visiting.has(topic)) return true;
    if (visited.has(topic)) return false;

    visiting.add(topic);
    for (const neighbor of adjacency.get(topic) || []) {
      if (dfs(neighbor)) return true;
    }
    visiting.delete(topic);
    visited.add(topic);
    return false;
  }

  for (const topic of adjacency.keys()) {
    if (dfs(topic)) return true;
  }

  return false;
}

function buildGraphSnapshot(nodes) {
  const edges = [];
  for (const node of nodes) {
    for (const prereq of node.prerequisites || []) {
      edges.push({
        from: prereq.topic,
        to: node.topic,
        weight: prereq.strength || 0.5,
        confidence: ((prereq.confidence || 70) / 100),
        soft: prereq.soft !== false
      });
    }
  }

  const nodesSorted = nodes.map((n) => n.topic).sort();
  const edgesSorted = edges
    .map((e) => `${e.from}->${e.to}:${e.weight}:${e.confidence}:${e.soft}`)
    .sort();

  const integrityHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ nodes: nodesSorted, edges: edgesSorted }))
    .digest("hex");

  return {
    nodes: nodesSorted,
    edges,
    integrityHash
  };
}

async function initializeDependencyGraph(options = {}) {
  const reason = options.reason || "Step 6 static topology bootstrap";
  const actor = options.actor || "system";

  if (detectCycle(STATIC_GRAPH)) {
    throw new Error("Cycle detected in static dependency topology");
  }
  console.log(`[DEPENDENCY] initializing graph reason=${reason}`);

  const now = new Date();
  const existingGraph = await DependencyGraphModel.findOne({ name: "default" }).sort({ version: -1 });
  const nextVersion = (existingGraph?.version || 0) + 1;

  const snapshot = buildGraphSnapshot(STATIC_GRAPH);
  const results = [];

  for (const node of STATIC_GRAPH) {
    const payload = {
      ...node,
      prerequisites: (node.prerequisites || []).map((p) => ({ ...p, soft: true })),
      prerequisites_count: (node.prerequisites || []).length,
      dependents_count: (node.unlocksTopics || []).length,
      commonSequences: [],
      learnedFromData: false,
      lastModified: now,
      modificationReason: reason,
      topologyVersion: nextVersion,
      lastCalibrated: now,
      updatedAt: now
    };

    const doc = await TopicDependencyModel.findOneAndUpdate(
      { topic: node.topic },
      payload,
      { upsert: true, new: true }
    );
    results.push(doc);
  }

  await DependencyEdgeModel.deleteMany({ graphVersion: nextVersion });
  for (const edge of snapshot.edges) {
    await DependencyEdgeModel.create({
      graphVersion: nextVersion,
      fromTopic: edge.from,
      toTopic: edge.to,
      weight: edge.weight,
      confidence: edge.confidence,
      soft: true,
      audit: {
        createdBy: actor,
        createdReason: reason,
        lastModifiedBy: actor
      },
      modificationHistory: [
        {
          modifiedAt: now,
          modifiedBy: actor,
          reason,
          previousWeight: edge.weight,
          previousConfidence: edge.confidence
        }
      ]
    });
  }

  await DependencyGraphModel.create({
    name: "default",
    version: nextVersion,
    roleScope: "global",
    nodesCount: snapshot.nodes.length,
    edgesCount: snapshot.edges.length,
    integrityHash: snapshot.integrityHash,
    snapshot,
    metadata: {
      createdBy: actor,
      updatedBy: actor,
      reason,
      topologyNotes: "Static topology only, soft prerequisites",
      debugInfo: {
        hasCycle: false,
        initializedAt: now
      }
    },
    lastIntegrityCheckAt: now
  });

  return {
    topicsSeeded: results.length,
    hasCycle: false,
    version: nextVersion,
    snapshotAt: now,
    integrityHash: snapshot.integrityHash
  };
}

async function getGraphSnapshot() {
  return DependencyGraphModel.findOne({ name: "default" }).sort({ version: -1 });
}

async function rollbackGraphVersion(version, actor = "system") {
  const source = await DependencyGraphModel.findOne({ name: "default", version });
  if (!source) {
    throw new Error(`Graph version ${version} not found`);
  }

  return initializeDependencyGraph({
    reason: `Rollback to version ${version}`,
    actor
  });
}

async function getRoleGraph(role = "fullstack") {
  if (!role || role === "fullstack") {
    return TopicDependencyModel.find({}).sort({ suggestedPosition: 1, topic: 1 });
  }

  return TopicDependencyModel.find({
    $or: [{ role }, { roles: role }, { role: "fullstack" }, { roles: "fullstack" }]
  }).sort({ suggestedPosition: 1, topic: 1 });
}

module.exports = {
  STATIC_GRAPH,
  initializeDependencyGraph,
  detectCycle,
  getRoleGraph,
  getGraphSnapshot,
  rollbackGraphVersion
};
