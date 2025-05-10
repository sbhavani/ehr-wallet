
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    positive: boolean;
  };
  className?: string;
}

export const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <div className={cn(
      "bg-white rounded-lg p-6 shadow-sm card-hover border border-gray-100",
      className
    )}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span 
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs. last week</span>
            </div>
          )}
        </div>
        
        <div className="rounded-full bg-medical-blue/10 p-3 text-medical-blue">
          {icon}
        </div>
      </div>
    </div>
  );
};
