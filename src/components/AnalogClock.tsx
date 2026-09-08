import React, { useState, useEffect } from 'react';

interface AnalogClockProps {
  scale?: number;
  className?: string;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ scale = 1, className = '' }) => {
  const [delays, setDelays] = useState<{
    hourDelay?: string;
    minuteDelay?: string;
    secondDelay?: string;
  }>({});

  useEffect(() => {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    const totalSecondsIn12Hours = hours * 3600 + minutes * 60 + seconds;
    const totalSecondsInHour = minutes * 60 + seconds;

    setDelays({
      hourDelay: `-${totalSecondsIn12Hours}s`,
      minuteDelay: `-${totalSecondsInHour}s`,
      secondDelay: `-${seconds}s`,
    });
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
              style={{ animationDelay: delays.hourDelay }}
            />
            <div
              className="minute"
              style={{ animationDelay: delays.minuteDelay }}
            />
            <div
              className="second"
              style={{ animationDelay: delays.secondDelay }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
