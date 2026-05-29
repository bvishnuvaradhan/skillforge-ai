import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { ConversationalUI } from './ConversationalUI';
import { MentorPreferencesPanel } from './MentorPreferencesPanel';
import { LuMessageCircle, LuX, LuChevronDown, LuSettings } from 'react-icons/lu';
// preserve imports and assigned locals
void motion;
void AnimatePresence;
void Card;
void ConversationalUI;
void MentorPreferencesPanel;
void LuMessageCircle;
void LuX;
void LuChevronDown;
void LuSettings;
void useEffect;

export function MentorPanel({
  isOpen = true,
  onClose,
  context = {},
  compact = false,
  userId = 'user'
}) {
  const [expanded, setExpanded] = useState(!compact);
  const [mentorResponse, setMentorResponse] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);

  // mark assigned-but-unused states as referenced to reduce lint noise
  void expanded;
  void setExpanded;
  void mentorResponse;

  const handleResponse = (response) => {
    setMentorResponse(response);
  };

  if (compact && !isOpen) {
    return null;
  }

  const panelVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    },
    exit: { opacity: 0, y: 20, scale: 0.95 }
  };

  if (compact) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={panelVariants}
        className="fixed bottom-4 right-4 z-40 max-w-md"
      >
        <Card depth="elevated" className="shadow-xl">
          <div className="p-4">
            {/* Compact header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LuMessageCircle size={18} className="text-cyan-400" />
                <h3 className="font-semibold text-sm">Mentor</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Close"
              >
                <LuX size={16} />
              </button>
            </div>

            {/* Compact UI */}
            <ConversationalUI
              context={context}
              onResponse={handleResponse}
              compact={true}
            />
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={panelVariants}
      className="w-full h-full flex flex-col"
    >
      <Card depth="level2" className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center">
              <LuMessageCircle size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Learning Mentor</h2>
              <p className="text-xs opacity-50">Ask me anything about your learning</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              aria-label="Mentor settings"
              title="Open mentor settings"
            >
              <LuSettings size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              aria-label="Close mentor"
            >
              <LuX size={18} />
            </button>
          </div>
        </div>

        {/* Preferences Panel or Main Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {showPreferences ? (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-4 overflow-y-auto h-full"
              >
                <MentorPreferencesPanel
                  userId={userId}
                  onClose={() => setShowPreferences(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ConversationalUI
                  context={context}
                  onResponse={setMentorResponse}
                  compact={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info footer */}
        <div className="p-3 border-t border-white/10 bg-white/5 text-xs opacity-70">
          <p>I have access to your learning data, roadmap, mastery levels, and governance policies. All conversations are private and auditable.</p>
        </div>
      </Card>
    </motion.div>
  );
}

// Floating mentor button (appears on dashboard)
export function MentorFloatingButton({ onClick, hasUnread = false }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow relative group"
      aria-label="Open mentor"
    >
      <LuMessageCircle size={20} />

      {hasUnread && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full"
        />
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Ask mentor a question
      </div>
    </motion.button>
  );
}

// Mentor panel container (for dashboard page)
export function MentorPanelContainer({ context, userId = 'user' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-6 z-30">
        <MentorFloatingButton
          onClick={() => setIsOpen(!isOpen)}
          hasUnread={false}
        />
      </div>

      {/* Full panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 h-[70vh] bg-slate-950 border-t border-white/10"
            >
              <MentorPanel
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                context={context}
                userId={userId}
                compact={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MentorPanel;
