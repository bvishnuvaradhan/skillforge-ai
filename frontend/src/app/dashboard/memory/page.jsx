"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/useAuth';
import { api } from '../../../lib/api';
import { MemoryLab } from '../../../components/dashboard/MemoryLab';
import { Button } from '../../../components/ui/Button';
import { LuArrowLeft } from 'react-icons/lu';
import { motion } from 'framer-motion';

export default function MemoryLabPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const [data, setData] = useState({ topicStats: [], decayLogs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.ready && !auth.user) {
      router.replace('/login');
    }
  }, [auth.ready, router, auth.user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, decayRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/decay').catch(() => ({ decayLogs: [] }))
        ]);
        setData({
          topicStats: dashboardRes?.topicStats || [],
          decayLogs: decayRes?.decayLogs || []
        });
      } catch (err) {
        console.error('Failed to load memory lab data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (auth.user) {
      fetchData();
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
          INITIALIZING LABORATORY_
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

      <MemoryLab topicStats={data.topicStats} decayLogs={data.decayLogs} />
    </div>
  );
}
