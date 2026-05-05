import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  accent?: boolean;
}

export default function StatCard({ icon, label, value, trend, trendLabel, accent }: StatCardProps) {
  const trendDir = trend === undefined ? null : trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';

  return (
    <div className="stat-card" style={accent ? { borderColor: 'var(--primary)', borderWidth: 1.5 } : {}}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ marginTop: 8 }}>{value}</div>
        </div>
        <div className="stat-icon">{icon}</div>
      </div>

      {trend !== undefined && (
        <div className={`stat-trend ${trendDir}`}>
          {trendDir === 'up' && <TrendingUp size={14} />}
          {trendDir === 'down' && <TrendingDown size={14} />}
          {trendDir === 'neutral' && <Minus size={14} />}
          <span>{Math.abs(trend)}% {trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
}
