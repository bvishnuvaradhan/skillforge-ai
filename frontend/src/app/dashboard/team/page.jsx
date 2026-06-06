"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { TeamDashboard } from '../../../components/dashboard/TeamDashboard';

export default function TeamPage() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-shell space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold mb-2">Team Intelligence Center</h1>
        <p className="text-sm opacity-60">Monitor group progress, track cohort mastery, and receive collaborative AI mentoring recommendations</p>
      </div>

      <TeamDashboard />
    </motion.section>
  );
}
