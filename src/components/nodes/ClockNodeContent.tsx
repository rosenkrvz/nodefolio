import React, { useState, useEffect } from 'react';
import { AnalogClock } from '../AnalogClock';
import { Clock as ClockIcon, Activity, Globe } from 'lucide-react';

export const ClockNodeContent: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeZone, setTimeZone] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
      setTimeZone(
        Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center pt-1 text-zinc-300">
      {/* Clock Face Container */}
      <div className="py-2.5 px-3 flex items-center justify-center">
        <AnalogClock scale={0.92} />
      </div>

      {/* Digital Real-Time Readout */}
      <div className="w-full mt-3 pt-3 border-t border-white/[0.06] text-center">
        <div className="font-tech text-base font-semibold text-white tracking-wider">
          {timeStr || '12:00:00 PM'}
        </div>
        <div className="font-tech text-[10px] text-zinc-400 mt-0.5">
          {dateStr}
        </div>
      </div>

      {/* System Timezone & Telemetry */}
      <div className="w-full grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-white/[0.04] text-[9px] font-tech text-zinc-500">
        <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-1.5 justify-center">
          <Globe className="w-3 h-3 text-rose-400" />
          <span className="truncate">{timeZone}</span>
        </div>
        <div className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-1.5 justify-center text-zinc-400">
          <Activity className="w-3 h-3 text-rose-500 animate-pulse" />
          <span>Real-time Sync</span>
        </div>
      </div>
    </div>
  );
};
