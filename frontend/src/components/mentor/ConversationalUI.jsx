import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuSend, LuLoader, LuChevronDown } from 'react-icons/lu';
import { ExplainabilityEngine } from '../lib/mentor/ExplainabilityEngine';
import { getConfidenceMetadata, getUncertaintyMetadata } from '../lib/mentor/types';

const explainabilityEngine = new ExplainabilityEngine();

export function ConversationalUI({ context = {}, onResponse, compact = false }) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  // selectedQuestion intentionally removed to avoid unused-state warnings
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Detect question type from input
  const detectQuestionType = (q) => {
    const lower = q.toLowerCase();

    if (
      lower.includes('why') &&
      (lower.includes('recommend') || lower.includes('suggest'))
    ) {
      return 'recommendation';
    }
    if (lower.includes('roadmap') || lower.includes('path')) {
      return 'roadmap';
    }
    if (
      lower.includes('depend') ||
      lower.includes('prerequisite') ||
      lower.includes('require')
    ) {
      return 'dependency';
    }
    if (
      lower.includes('forget') ||
      lower.includes('retain') ||
      lower.includes('practice')
    ) {
      return 'retention';
    }
    if (lower.includes('forecast') || lower.includes('predict')) {
      return 'forecast';
    }
    if (lower.includes('policy') || lower.includes('cooldown')) {
      return 'governance';
    }

    return 'recommendation'; // default
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    // Add user message
    const userMessage = { type: 'user', text: question };
    setConversation((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const questionType = detectQuestionType(question);
      const explanation = await explainabilityEngine.generateExplanation(
        questionType,
        context
      );

      const assistantMessage = {
        type: 'assistant',
        explanation,
        questionType
      };

      setConversation((prev) => [...prev, assistantMessage]);

      if (onResponse) {
        onResponse(explanation);
      }
    } catch (error) {
      console.error('Failed to generate response:', error);
      const errorMessage = {
        type: 'assistant',
        explanation: {
          type: 'DefaultExplanation',
          message: 'Sorry, I encountered an error generating an explanation. Please try again.',
          confidence: 0,
          uncertainty: { level: 'high', reason: 'Error occurred', disclaimer: '' },
          reasoning: { dataPoints: [], governanceApplied: [], alternatives: [] }
        }
      };

      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    { type: 'recommendation', text: 'Why is this recommended?' },
    { type: 'roadmap', text: 'Explain my learning roadmap' },
    { type: 'retention', text: 'Why should I practice this now?' },
    { type: 'forecast', text: "What's my progress forecast?" }
  ];

  const handleSuggestedQuestion = async (q) => {
    // set suggested text and submit immediately
    setQuestion(q.text);
    // Use next tick to ensure state updates before submit
    setTimeout(() => handleSubmit({ preventDefault: () => {} }), 0);
  };

  if (compact && conversation.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs opacity-70 mb-3">Quick questions:</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestedQuestions.slice(0, 2).map((q, i) => (
            <button
              key={i}
              onClick={() => handleSuggestedQuestion(q)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-left transition-all"
            >
              {q.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {conversation.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 py-4"
            >
              <p className="text-sm opacity-80">
                Ask me anything about your learning. I'll explain recommendations,
                roadmap structure, topic dependencies, retention patterns, and more.
              </p>

              <div className="space-y-2">
                <p className="text-xs opacity-70 font-semibold">Examples:</p>
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left text-sm transition-all hover:border-cyan-500/30"
                  >
                    <span className="opacity-70 hover:opacity-100">→</span> {q.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {conversation.map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'user' ? (
              <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg p-3 max-w-xs text-sm">
                {message.text}
              </div>
            ) : (
              <ExplanationMessage explanation={message.explanation} />
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-center text-sm opacity-70"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
              <LuLoader size={16} />
            </motion.div>
            Thinking...
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:bg-white/10 transition-all text-sm placeholder-white/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 disabled:opacity-50 transition-all"
            aria-label="Send"
          >
            <LuSend size={16} />
          </button>
        </div>
        <p className="text-xs opacity-50">
          All explanations include confidence levels and uncertainty disclaimers.
        </p>
      </form>
    </div>
  );
}

// Explanation message component
function ExplanationMessage({ explanation }) {
  const [expanded, setExpanded] = useState(false);
  const confidenceMetadata = getConfidenceMetadata(explanation.confidence);
  const uncertaintyMetadata = getUncertaintyMetadata(explanation.uncertainty);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-w-md space-y-3 text-sm">
      {/* Main message */}
      <p className="leading-relaxed">{explanation.message}</p>

      {/* Confidence badge */}
      <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10">
        <span className="text-lg">{confidenceMetadata.icon}</span>
        <span className="text-xs opacity-80">
          {confidenceMetadata.label} confidence
        </span>
      </div>

      {/* Uncertainty */}
      {explanation.uncertainty.level !== 'none' && (
        <div
          className={`px-3 py-2 rounded border ${uncertaintyMetadata.backgroundColor} ${uncertaintyMetadata.textColor} border-current/30`}
        >
          <p className="text-xs font-semibold mb-1">
            ⚠️ {explanation.uncertainty.reason}
          </p>
          {explanation.uncertainty.disclaimer && (
            <p className="text-xs opacity-90">{explanation.uncertainty.disclaimer}</p>
          )}
        </div>
      )}

      {/* Expandable details */}
      {(explanation.reasoning.dataPoints.length > 0 ||
        explanation.reasoning.alternatives.length > 0) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
        >
          Show details
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <LuChevronDown size={12} />
          </motion.div>
        </button>
      )}

      {/* Details section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-2 border-t border-white/10"
          >
            {explanation.reasoning.dataPoints.length > 0 && (
              <div>
                <p className="text-xs opacity-80 font-semibold mb-1">Evidence:</p>
                <ul className="space-y-1 text-xs opacity-70">
                  {explanation.reasoning.dataPoints.map((point, i) => (
                    <li key={i} className="pl-2 border-l border-cyan-500/30">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.reasoning.alternatives.length > 0 && (
              <div>
                <p className="text-xs opacity-80 font-semibold mb-1">Other options:</p>
                <ul className="space-y-1 text-xs opacity-70">
                  {explanation.reasoning.alternatives.map((alt, i) => (
                    <li key={i}>• {alt}</li>
                  ))}
                </ul>
              </div>
            )}

            {explanation.reasoning.governanceApplied.length > 0 && (
              <p className="text-xs opacity-60 italic">
                Policies: {explanation.reasoning.governanceApplied.join(', ')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ConversationalUI;
