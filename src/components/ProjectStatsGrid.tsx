import { Clock, DollarSign, Target, Timer } from "lucide-react";
import { ProjectStats } from "@/types/csv";
import { useCurrency } from "@/contexts/currency";

interface ProjectStatsGridProps {
  projectStats: Record<string, ProjectStats>;
}

export const ProjectStatsGrid = ({ projectStats }: ProjectStatsGridProps) => {
  const { formatAmount } = useCurrency();

  const sortedProjects = Object.entries(projectStats)
    .sort(([, a], [, b]) => b.totalHours - a.totalHours);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
      {sortedProjects.map(([projectName, stats]) => {
        const avgTimePerTaskMinutes = (stats.totalHours / stats.itemCount) * 60;
        
        return (
          <div key={projectName} className="rounded-lg bg-accent/50 p-4 hover:bg-accent/70 transition-colors">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b border-border/50">{projectName}</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Earnings</span>
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatAmount(stats.totalEarnings)}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Hours</span>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">
                  {stats.totalHours.toFixed(1)}h
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Tasks</span>
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">
                  {stats.itemCount}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Avg. Time/Task</span>
                  <Timer className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">
                  {Math.round(avgTimePerTaskMinutes)}m
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 