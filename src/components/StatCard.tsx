import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
}

export default function StatCard({ icon, label, value, trend, trendLabel }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[color:var(--color-text-secondary)] text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-[color:var(--color-text-primary)] mt-2">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              {trend >= 0 ? (
                <TrendingUp size={16} className="text-green-600" />
              ) : (
                <TrendingDown size={16} className="text-red-600" />
              )}
              <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}% {trendLabel || 'vs last month'}
              </span>
            </div>
          )}
        </div>
        <div className="text-[color:var(--color-primary)] opacity-80">{icon}</div>
      </div>
    </div>
  );
}
