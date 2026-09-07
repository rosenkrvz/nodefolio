import React, { useMemo } from 'react';

interface AnalogClockProps {
  scale?: number;
  className?: string;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ scale = 1, className = '' }) => {
  // Synchronize initial animation delay to real local time
  const { hourDelay, minuteDelay, secondDelay } = useMemo(() => {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    const totalSecondsIn12Hours = hours * 3600 + minutes * 60 + seconds;
    const totalSecondsInHour = minutes * 60 + seconds;

    return {
      hourDelay: `-${totalSecondsIn12Hours}s`,
      minuteDelay: `-${totalSecondsInHour}s`,
      secondDelay: `-${seconds}s`,
    };
  }, []);

  return (
    <div
      className={`clock-wrapper flex items-center justify-center select-none ${className}`}
      style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}
    >
      <div className="face">
        <p className="v-index font-display font-bold">II</p>
        <p className="h-index font-display font-bold">II</p>
        <div className="hand">
          <div className="hand">
            <div
              className="hour"
              style={{ animationDelay: hourDelay }}
            />
            <div
              className="minute"
              style={{ animationDelay: minuteDelay }}
            />
            <div
              className="second"
              style={{ animationDelay: secondDelay }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
