import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuHelpCircle, LuX } from 'react-icons/lu';

// preserve imports for lint
void motion;
void AnimatePresence;
void LuHelpCircle;
void LuX;
import { ExplainabilityEngine } from '../lib/mentor/ExplainabilityEngine';
import { getConfidenceMetadata, getUncertaintyMetadata } from '../lib/mentor/types';

const explainabilityEngine = new ExplainabilityEngine();

export function InlineExplainButton({
  questionType,
  context,
  label = 'Why?',
  onExplain,
  className = '',
  size = 'sm'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();

    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const exp = await explainabilityEngine.generateExplanation(
        questionType,
        context
      );
      setExplanation(exp);
      setIsOpen(true);

      if (onExplain) {
        onExplain(exp);
      }
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      setExplanation({
        type: 'DefaultExplanation',
        message: 'Unable to generate explanation. Try again later.',
        confidence: 0,
        uncertainty: { level: 'high', reason: 'Error occurred', disclaimer: '' }
      });
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    xs: 'p-1 text-xs',
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm'
  };

  const buttonClasses = `
    inline-flex items-center gap-1
    rounded-lg px-2 py-1
    bg-white/5 hover:bg-white/10
    border border-white/10 hover:border-cyan-500/30
    transition-all duration-200
    opacity-60 hover:opacity-100
    ${sizeClasses[size] || sizeClasses.sm}
    ${className}
  `;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className={buttonClasses}
        aria-label={`${label} - Show explanation`}
        title={`${label}: Why is this recommended?`}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <LuHelpCircle size={14} />
          </motion.div>
        ) : (
          <LuHelpCircle size={14} />
        )}
        <span className="hidden sm:inline">{label}</span>
      </button>

      {/* Explanation Popup */}
      <AnimatePresence>
        {isOpen && explanation && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-full right-0 mt-2 w-80 z-50 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ExplanationPanel
              explanation={explanation}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Explanation panel component
function ExplanationPanel({ explanation, onClose }) {
  const confidenceMetadata = getConfidenceMetadata(explanation.confidence);
  const uncertaintyMetadata = getUncertaintyMetadata(explanation.uncertainty);

  return (
    <div className="bg-slate-900/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg p-4 text-white space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Explanation</h3>
          <p className="text-xs opacity-70">{explanation.type}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Close"
        >
          <LuX size={16} />
        </button>
      </div>

      {/* Main message */}
      <p className="text-sm leading-relaxed">{explanation.message}</p>

      {/* Confidence badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
        <span className="text-lg">{confidenceMetadata.icon}</span>
        <div>
          <p className="text-xs font-semibold opacity-90">
            Confidence: {confidenceMetadata.label}
          </p>
          <p className="text-xs opacity-70">{confidenceMetadata.tooltip}</p>
        </div>
      </div>

      {/* Uncertainty indicator */}
      {explanation.uncertainty.level !== 'none' && (
        <div
          className={`px-3 py-2 rounded-lg border ${uncertaintyMetadata.backgroundColor} ${uncertaintyMetadata.textColor} border-current/30`}
        >
          <p className="text-xs font-semibold mb-1 flex items-center gap-2">
            <span>{uncertaintyMetadata.icon}</span>
            Uncertainty: {explanation.uncertainty.reason}
          </p>
          {explanation.uncertainty.disclaimer && (
            <p className="text-xs opacity-85">{explanation.uncertainty.disclaimer}</p>
          )}
        </div>
      )}

      {/* Data points */}
      {explanation.reasoning.dataPoints.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold opacity-90">Evidence:</p>
          <ul className="space-y-1">
            {explanation.reasoning.dataPoints.map((point, i) => (
              <li
                key={i}
                className="text-xs opacity-80 pl-3 border-l border-cyan-500/30"
              >
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternatives */}
      {explanation.reasoning.alternatives.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-xs font-semibold opacity-90">Other options:</p>
          <ul className="space-y-1">
            {explanation.reasoning.alternatives.map((alt, i) => (
              <li key={i} className="text-xs opacity-70">
                • {alt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Policies applied */}
      {explanation.reasoning.governanceApplied.length > 0 && (
        <div className="text-xs opacity-70 italic pt-2 border-t border-white/10">
          Policies applied: {explanation.reasoning.governanceApplied.join(', ')}
        </div>
      )}
    </div>
  );
}

export default InlineExplainButton;

// ensure linter sees the local component as used
void ExplanationPanel;
