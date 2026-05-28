import { motion } from 'framer-motion';
import { AdminGovernanceConsole } from '../components/dashboard/AdminGovernanceConsole';
import { Button } from '../components/ui/Button';
import { LuArrowLeft, LuShield } from 'react-icons/lu';
import { useRouter } from 'next/navigation';

export function AdminConsolePage() {
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
          Back
        </button>
        <div className="flex items-center gap-3 mb-4">
          <LuShield size={32} className="text-amber-400" />
          <div>
            <h1 className="text-4xl font-bold">Admin & Governance Console</h1>
            <p className="text-sm opacity-60">System monitoring, event tracking, and governance controls</p>
          </div>
        </div>
      </div>

      {/* Console */}
      <AdminGovernanceConsole />

      {/* Security Notice */}
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm opacity-80">
        <p>⚠️ This console is for authorized administrators only. All activity is logged and audited.</p>
      </div>
    </motion.section>
  );
}

export default AdminConsolePage;
