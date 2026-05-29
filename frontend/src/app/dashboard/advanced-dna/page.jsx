import { motion } from 'framer-motion';
import { AdvancedSkillDNA } from '../components/dashboard/AdvancedSkillDNA';
import { TrustAndStabilityIndicators } from '../components/dashboard/TrustAndStability';
import { LuArrowLeft, LuDownload, LuShare2 } from 'react-icons/lu';
import { useRouter } from 'next/navigation';

export function AdvancedSkillDNAPage() {
  const router = useRouter();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-shell space-y-8"
    >
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity mb-4"
        >
          <LuArrowLeft size={16} />
          Back to Skill DNA
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Advanced Skill DNA Profile</h1>
            <p className="text-sm opacity-60">Deep analysis including peer comparison and optimization recommendations</p>
          </div>
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 rounded bg-white/5">Export</button>
              <button className="text-xs px-2 py-1 rounded bg-white/5">Share</button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="p-8">
          <AdvancedSkillDNA />
        </div>
      </motion.div>

      {/* Trust & Stability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
      >
        <div>
          <h2 className="text-2xl font-semibold mb-6">Trust & Stability Analysis</h2>
          <div className="p-6">
            <TrustAndStabilityIndicators
              recommendation={{
                title: 'Practice: Dynamic Programming - Coin Change',
                stability: 0.85,
                confidence: 0.88,
                predictability: 0.92,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Export & Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
      >
        <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl -z-1" />
          <h3 className="text-lg font-semibold mb-3 relative z-10">Export Your Profile</h3>
          <p className="text-sm opacity-70 mb-4 relative z-10">Download your complete Skill DNA profile, learning history, and optimization recommendations</p>
          <button className="text-sm px-3 py-2 rounded bg-white/5 relative z-10">Download as PDF Report</button>
        </div>
      </motion.div>
    </motion.section>
  );
}

export default AdvancedSkillDNAPage;
