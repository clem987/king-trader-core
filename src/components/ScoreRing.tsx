interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ScoreRing({ score, size = 120, strokeWidth = 8, label }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score value
  const getColors = () => {
    if (score >= 75) return { start: 'hsl(142, 71%, 45%)', end: 'hsl(142, 60%, 35%)' };
    if (score >= 50) return { start: 'hsl(36, 90%, 55%)', end: 'hsl(24, 95%, 53%)' };
    return { start: 'hsl(0, 84%, 60%)', end: 'hsl(0, 70%, 50%)' };
  };
  const colors = getColors();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={`ring-grad-${size}-${score >= 75 ? 'g' : score >= 50 ? 'o' : 'r'}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={`url(#ring-grad-${size}-${score >= 75 ? 'g' : score >= 50 ? 'o' : 'r'})`}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-display">{score}</span>
          {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
        </div>
      </div>
    </div>
  );
}
