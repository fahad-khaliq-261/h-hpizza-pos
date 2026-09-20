import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  trend,
  trendSubtitle = 'vs yesterday',
  icon: Icon,
  variant = 'primary'
}) {
  const isPositive = trend && trend.startsWith('+');
  const isNegative = trend && trend.startsWith('-');

  return (
    <div className={`kpi-card kpi-${variant}`}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div className={`kpi-icon-wrap bg-${variant}-light text-${variant}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="kpi-value font-sans">{value}</div>

      {trend && (
        <div className="kpi-footer">
          <span className={`kpi-trend ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
            {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
            {trend}
          </span>
          <span className="kpi-subtitle">{trendSubtitle}</span>
        </div>
      )}
    </div>
  );
}
