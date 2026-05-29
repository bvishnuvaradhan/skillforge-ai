// ExplanationTypes - Type definitions for explanation system
// Ensures consistency across all explanation types with uncertainty handling

export type ConfidenceLevel = 'high' | 'moderate' | 'low';
export type UncertaintyLevel = 'high' | 'moderate' | 'low' | 'none';

export interface Uncertainty {
  level: UncertaintyLevel;
  reason: string;           // Why uncertain (data gaps, edge cases, etc.)
  disclaimer: string;       // User-facing caveat
}

export interface ExplanationReasoning {
  dataPoints: string[];          // Data supporting explanation
  governanceApplied: string[];   // Policies that influenced this
  alternatives: string[];         // Other paths considered
}

export interface BaseExplanation {
  type: ExplanationType;
  message: string;               // User-facing explanation
  confidence: number;            // 0-1 confidence score
  uncertainty: Uncertainty;      // Uncertainty metadata
  reasoning: ExplanationReasoning;
  linkedTo?: {
    topic?: string;
    recommendation?: string;
    roadmapNode?: string;
  };
}

export type ExplanationType =
  | 'RecommendationExplanation'
  | 'RoadmapExplanation'
  | 'DependencyExplanation'
  | 'RetentionExplanation'
  | 'ForecastExplanation'
  | 'GovernanceExplanation'
  | 'DefaultExplanation';

// Specific explanation types

export interface RecommendationExplanation extends BaseExplanation {
  type: 'RecommendationExplanation';
  reasoning: ExplanationReasoning & {
    masteryScore?: number;
    mastery?: Record<string, number>;
  };
}

export interface RoadmapExplanation extends BaseExplanation {
  type: 'RoadmapExplanation';
  reasoning: ExplanationReasoning & {
    roadmapStructure?: string;
    userDNA?: string;
  };
}

export interface DependencyExplanation extends BaseExplanation {
  type: 'DependencyExplanation';
  reasoning: ExplanationReasoning & {
    prerequisite: string;
    masterTopic: string;
    masteryGap?: number;
  };
}

export interface RetentionExplanation extends BaseExplanation {
  type: 'RetentionExplanation';
  reasoning: ExplanationReasoning & {
    currentRetention: number;
    daysSincePractice: number;
    decayRate: number;
    nextRecommendedReview: string;
  };
}

export interface ForecastExplanation extends BaseExplanation {
  type: 'ForecastExplanation';
  reasoning: ExplanationReasoning & {
    currentMastery: number;
    projectedMastery: number;
    timeHorizon: string;
    improvementDirection: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface GovernanceExplanation extends BaseExplanation {
  type: 'GovernanceExplanation';
  reasoning: ExplanationReasoning & {
    policyType: string;
    policyReason: string;
    durationRemaining?: string;
  };
}

export interface DefaultExplanation extends BaseExplanation {
  type: 'DefaultExplanation';
}

// Union type for all explanations
export type Explanation =
  | RecommendationExplanation
  | RoadmapExplanation
  | DependencyExplanation
  | RetentionExplanation
  | ForecastExplanation
  | GovernanceExplanation
  | DefaultExplanation;

// Explanation request/response
export interface ExplanationRequest {
  questionType:
    | 'recommendation'
    | 'roadmap'
    | 'dependency'
    | 'retention'
    | 'forecast'
    | 'governance'
    | 'custom';
  context: Record<string, any>;
  userId: string;
  timestamp: number;
}

export interface ExplanationResponse {
  success: boolean;
  explanation?: Explanation;
  error?: string;
  generatedAt: number;
  cacheHit?: boolean;
}

// Explanation UI component props
export interface ExplanationUIProps {
  explanation: Explanation;
  onAskFollowUp?: Function;
  onRequestAlternative?: Function;
  compact?: boolean;
}

// Confidence display metadata
export interface ConfidenceMetadata {
  score: number;            // 0-1
  label: 'Low' | 'Moderate' | 'High';
  icon: '⚠️' | 'ⓘ' | '✓';
  tooltip: string;
}

// Uncertainty display metadata
export interface UncertaintyMetadata {
  level: UncertaintyLevel;
  icon: string;
  backgroundColor: string;  // Tailwind class
  textColor: string;        // Tailwind class
  displayText: string;      // "Learn more data to improve"
}

// Helper functions to create metadata
export function getConfidenceMetadata(score: number): ConfidenceMetadata {
  if (score < 0.6) {
    return {
      score,
      label: 'Low',
      icon: '⚠️',
      tooltip: 'Limited data available for this recommendation'
    };
  }
  if (score < 0.8) {
    return {
      score,
      label: 'Moderate',
      icon: 'ⓘ',
      tooltip: 'Good confidence based on available data'
    };
  }
  return {
    score,
    label: 'High',
    icon: '✓',
    tooltip: 'High confidence based on comprehensive data'
  };
}

export function getUncertaintyMetadata(
  uncertainty: Uncertainty
): UncertaintyMetadata {
  const levels = {
    high: {
      backgroundColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      displayText: 'High uncertainty — more data will improve accuracy'
    },
    moderate: {
      backgroundColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      displayText: 'Moderate uncertainty — helpful but take with a grain of salt'
    },
    low: {
      backgroundColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      displayText: 'Low uncertainty — confident in this explanation'
    },
    none: {
      backgroundColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      displayText: ''
    }
  };

  const metadata = levels[uncertainty.level];
  return {
    level: uncertainty.level,
    icon: uncertainty.level === 'high' ? '⚠️' : uncertainty.level === 'low' ? '✓' : 'ⓘ',
    ...metadata
  };
}
