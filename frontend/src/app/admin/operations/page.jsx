"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { OperationsCenter } from '../../../components/dashboard/OperationsCenter';
import { LuArrowLeft } from 'react-icons/lu';
import { useRouter } from 'next/navigation';

function OperationsPage() {
  const router = useRouter();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-shell space-y-8"
    >
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity mb-4"
        >
          <LuArrowLeft size={16} />
          Back to Dashboard
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Operations Center</h1>
            <p className="text-sm opacity-60">System telemetry, API latencies, queue health, cache hit rates, and cost audits</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <OperationsCenter />
      </motion.div>
    </motion.section>
  );
}

export default OperationsPage;
