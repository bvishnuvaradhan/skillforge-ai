import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { LuTrendingUp, LuCalendar } from 'react-icons/lu';

export function ForecastChart({ data = [], title = 'Skill Forecast', timeframe = '30 days' }) {
  const chartData = data.length > 0 ? data : generateMockForecastData();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LuTrendingUp size={20} className="text-purple-400" />
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs opacity-50">
              <LuCalendar size={14} />
              {timeframe}
            </div>
          </div>
          <p className="text-xs opacity-50">Projected mastery growth based on current trajectory</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value) => `${Math.round(value)}%`}
            />
            <Area
              type="monotone"
              dataKey="mastery"
              stroke="#06B6D4"
              strokeWidth={2}
              fill="url(#gradientForecast)"
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/5 rounded p-3">
            <p className="opacity-50 text-xs mb-1">Current Trajectory</p>
            <p className="font-bold text-cyan-400">+2.3% per day</p>
          </div>
          <div className="bg-white/5 rounded p-3">
            <p className="opacity-50 text-xs mb-1">Estimated 30-Day Target</p>
            <p className="font-bold text-emerald-400">78% mastery</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function ConsistencyGraph({ data = [], title = 'Learning Consistency' }) {
  const chartData = data.length > 0 ? data : generateMockConsistencyData();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-xs opacity-50">Weekly problem-solving activity and streak</p>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              formatter={(value) => `${value} problems`}
            />
            <Bar dataKey="problems" fill="#06B6D4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <p className="opacity-50 mb-1">This Week</p>
            <p className="font-bold text-lg text-cyan-400">18</p>
          </div>
          <div className="text-center">
            <p className="opacity-50 mb-1">Best Day</p>
            <p className="font-bold text-lg text-emerald-400">5</p>
          </div>
          <div className="text-center">
            <p className="opacity-50 mb-1">Current Streak</p>
            <p className="font-bold text-lg text-purple-400">7d</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function DecayVisualization({ topics = [] }) {
  const chartData = topics.slice(0, 8).map(t => ({
    name: t.topic || 'Unknown',
    retention: Math.round((t.retentionScore || 0) * 100),
    daysSince: t.daysSinceSolved || 0,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Skill Decay Analysis</h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '11px' }}
            />
            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              formatter={(value) => `${value}% retention`}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="retention"
              stroke="#06B6D4"
              strokeWidth={2}
              dot={{ fill: '#06B6D4', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-2 text-sm">
          {chartData.map((item, idx) => {
            const intensity = item.retention >= 80 ? 'high' : item.retention >= 60 ? 'medium' : 'low';
            const intensityColor =
              intensity === 'high' ? 'bg-emerald-500/20 text-emerald-300' :
              intensity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
              'bg-red-500/20 text-red-300';

            return (
              <div key={idx} className="flex justify-between items-center p-2 rounded bg-white/5">
                <span className="text-xs">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${intensityColor}`}>
                    {item.retention}%
                  </span>
                  <span className="text-xs opacity-50">{item.daysSince}d ago</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

// Mock data generators for demo
function generateMockForecastData() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    mastery: 45 + Math.random() * 30 + i * 1.5,
  }));
}

function generateMockConsistencyData() {
  return Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    problems: Math.floor(Math.random() * 5) + 1,
  }));
}

export default { ForecastChart, ConsistencyGraph, DecayVisualization };
