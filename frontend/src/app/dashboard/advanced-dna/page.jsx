import React from 'react';
import { motion } from 'framer-motion';
import { AdvancedSkillDNA } from '../components/dashboard/AdvancedSkillDNA';
import { TrustAndStabilityIndicators } from '../components/dashboard/TrustAndStability';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
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
            <Button variant="secondary" icon={LuDownload} className="text-xs">
              Export
            </Button>
            <Button variant="secondary" icon={LuShare2} className="text-xs">
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AdvancedSkillDNA />

      {/* Trust & Stability */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Trust & Stability Analysis</h2>
        <TrustAndStabilityIndicators
          recommendation={{
            title: 'Practice: Dynamic Programming - Coin Change',
            stability: 0.85,
            confidence: 0.88,
            predictability: 0.92,
          }}
        />
      </div>

      {/* Export & Integration */}
      <Card className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <h3 className="text-lg font-semibold mb-3">Export Your Profile</h3>
        <p className="text-sm opacity-70 mb-4">Download your complete Skill DNA profile, learning history, and optimization recommendations</p>
        <Button variant="secondary" className="text-sm">
          Download as PDF Report
        </Button>
      </Card>
    </motion.section>
  );
}

export default AdvancedSkillDNAPage;
