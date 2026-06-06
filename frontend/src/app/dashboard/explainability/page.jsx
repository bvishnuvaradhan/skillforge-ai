"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/useAuth';
import { api } from '../../../lib/api';
import { ExplainabilityCenter } from '../../../components/dashboard/ExplainabilityCenter';
import { Button } from '../../../components/ui/Button';
import { LuArrowLeft } from 'react-icons/lu';
import { motion } from 'framer-motion';

export default function ExplainabilityPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.ready && !auth.user) {
      router.replace('/login');
    }
  }, [auth.ready, router, auth.user]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get('/analytics/insights');
        setInsights(res?.insights || []);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    };

    if (auth.user) {
      fetchInsights();
    }
  }, [auth.user]);

  if (!auth.ready || !auth.user || loading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-cyan-400 font-mono tracking-widest text-sm"
        >
          INITIALIZING CONSOLE_
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-shell dashboard-page space-y-6 pb-12">
      <div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-xs opacity-50 hover:opacity-100 transition-opacity mb-4 text-white"
        >
          <LuArrowLeft size={14} />
          Back to Dashboard
        </button>
      </div>

      <ExplainabilityCenter insights={insights} />
    </div>
  );
}
