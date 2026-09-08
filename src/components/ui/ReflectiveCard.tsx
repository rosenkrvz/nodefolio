import React from 'react';

export interface ReflectiveCardProps {
  value?: string | number;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * ReflectiveCard
 * A sleek, high-precision dark card with dynamic light beam reflection,
 * animated orbiting perimeter beacon dot, and editorial quadrant framing lines.
 * 
 * Preserved for future additions (e.g., node telemetry, statistics showcase, or interactive cards).
 */
export const ReflectiveCard: React.FC<ReflectiveCardProps> = ({
  value = '750k',
  label = 'Views',
  children,
  className = '',
  onClick,
}) => {
  return (
    <>
      <style>{`
        @keyframes reflectiveMoveDot {
          0%,
          100% {
            top: 10%;
            right: 10%;
          }
          25% {
            top: 10%;
            right: calc(100% - 35px);
          }
          50% {
            top: calc(100% - 30px);
            right: calc(100% - 35px);
          }
          75% {
            top: calc(100% - 30px);
            right: 10%;
          }
        }
        .reflective-outer {
          width: 300px;
          height: 250px;
          border-radius: 10px;
          padding: 1px;
          background: radial-gradient(circle 230px at 0% 0%, #ffffff, #0c0d0d);
          position: relative;
        }
        .reflective-dot {
          width: 5px;
          aspect-ratio: 1;
          position: absolute;
          background-color: #fff;
          box-shadow: 0 0 10px #ffffff;
          border-radius: 100px;
          z-index: 2;
          right: 10%;
          top: 10%;
          animation: reflectiveMoveDot 6s linear infinite;
        }
        .reflective-card {
          z-index: 1;
          width: 100%;
          height: 100%;
          border-radius: 9px;
          border: solid 1px #202222;
          background: radial-gradient(circle 280px at 0% 0%, #444444, #0c0d0d);
          background-size: 20px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-direction: column;
          color: #fff;
          overflow: hidden;
        }
        .reflective-ray {
          width: 220px;
          height: 45px;
          border-radius: 100px;
          position: absolute;
          background-color: #c7c7c7;
          opacity: 0.4;
          box-shadow: 0 0 50px #fff;
          filter: blur(10px);
          transform-origin: 10%;
          top: 0%;
          left: 0;
          transform: rotate(40deg);
          pointer-events: none;
        }
        .reflective-text {
          font-weight: bolder;
          font-size: 4rem;
          background: linear-gradient(45deg, #000000 4%, #fff, #000);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          line-height: 1;
        }
        .reflective-line {
          width: 100%;
          height: 1px;
          position: absolute;
          background-color: #2c2c2c;
          pointer-events: none;
        }
        .reflective-topl {
          top: 10%;
          background: linear-gradient(90deg, #888888 30%, #1d1f1f 70%);
        }
        .reflective-bottoml {
          bottom: 10%;
        }
        .reflective-leftl {
          left: 10%;
          width: 1px;
          height: 100%;
          background: linear-gradient(180deg, #747474 30%, #222424 70%);
        }
        .reflective-rightl {
          right: 10%;
          width: 1px;
          height: 100%;
        }
      `}</style>

      <div className={`reflective-outer ${className}`} onClick={onClick}>
        <div className="reflective-dot" />
        <div className="reflective-card">
          <div className="reflective-ray" />
          {children ? (
            children
          ) : (
            <>
              <div className="reflective-text font-display">{value}</div>
              <div className="font-body text-sm tracking-wider uppercase text-zinc-300 mt-2 font-medium">
                {label}
              </div>
            </>
          )}
          <div className="reflective-line reflective-topl" />
          <div className="reflective-line reflective-leftl" />
          <div className="reflective-line reflective-bottoml" />
          <div className="reflective-line reflective-rightl" />
        </div>
      </div>
    </>
  );
};
