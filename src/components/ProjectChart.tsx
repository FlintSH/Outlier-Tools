import * as React from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStats } from "@/types/csv";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ChartType = "earningsByProject" | "earningsByDay" | "hoursByProject" | "hoursByDay";

interface ProjectChartProps {
  data: Record<string, ProjectStats>;
  type: ChartType;
  onTypeChange: (type: ChartType) => void;
}

const CHART_COLORS = {
  earnings: "#2563eb",
  overtime: "#dc2626",
  hours: "#16a34a",
  warning: "#ea580c"
};

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "earningsByProject", label: "Earnings by Project" },
  { value: "earningsByDay", label: "Earnings by Day" },
  { value: "hoursByProject", label: "Hours by Project" },
  { value: "hoursByDay", label: "Hours by Day" }
];

export const ProjectChart = ({ data, type, onTypeChange }: ProjectChartProps) => {
  const chartData = React.useMemo(() => {
    if (type === "earningsByDay" || type === "hoursByDay") {
      const dailyData: Record<string, { earnings: number; hours: number; overtime: number }> = {};
      
      const dates = Object.values(data)
        .flatMap(stats => stats.items || [])
        .map(item => new Date(item.workDate));
      
      const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        dailyData[dateKey] = { earnings: 0, hours: 0, overtime: 0 };
      }

      Object.values(data).flatMap(stats => stats.items || []).forEach(item => {
        const date = new Date(item.workDate).toISOString().split('T')[0];
        if (item.payType === "overtimePay") {
          dailyData[date].overtime += item.payout;
        } else {
          dailyData[date].earnings += item.payout;
        }
        dailyData[date].hours += item.duration.totalSeconds / 3600;
      });

      return Object.entries(dailyData)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, stats]) => ({
          name: new Date(date).toLocaleDateString(),
          earnings: Number(stats.earnings.toFixed(2)),
          overtime: Number(stats.overtime.toFixed(2)),
          hours: Number(stats.hours.toFixed(1))
        }));
    }

    return Object.entries(data).map(([name, stats]) => ({
      name,
      earnings: Number((stats.totalEarnings - (stats.overtimePay || 0)).toFixed(2)),
      overtime: Number((stats.overtimePay || 0).toFixed(2)),
      hours: Number(stats.totalHours.toFixed(1)),
      hourlyRate: Number(stats.averageRate.toFixed(2)),
      overtimePercentage: Number(((stats.overtimePay || 0) / stats.totalEarnings * 100).toFixed(1)),
      taskCount: stats.itemCount
    }));
  }, [data, type]);

  return (
    <Card className="col-span-4">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Project Statistics</CardTitle>
          <div className="flex flex-wrap gap-2">
            {CHART_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={type === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onTypeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  switch (name) {
                    case "hours":
                      return [`${value}h`, "Hours"];
                    case "hourlyRate":
                      return [`$${value}/hr`, "Average Rate"];
                    case "overtime":
                      return [`$${value}`, "Exceeded Time Pay"];
                    default:
                      return [`$${value}`, "Regular Earnings"];
                  }
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-sm">
                        <p className="font-medium">{data.name}</p>
                        {type.startsWith("hours") ? (
                          <p className="text-sm">Hours: {data.hours}h</p>
                        ) : (
                          <>
                            {data.hourlyRate && (
                              <p className="text-sm text-muted-foreground">
                                Average Rate: ${data.hourlyRate}/hr
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Hours Worked: {data.hours}h
                            </p>
                            {data.taskCount && (
                              <p className="text-sm text-muted-foreground">
                                Tasks Completed: {data.taskCount}
                              </p>
                            )}
                            <p className="text-sm">
                              Regular Earnings: ${data.earnings}
                            </p>
                            {data.overtime > 0 && (
                              <p className="text-sm">
                                Exceeded Time Pay: ${data.overtime}
                              </p>
                            )}
                            {data.overtimePercentage > 50 && (
                              <p className="text-sm text-[#dc2626] flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                {data.overtimePercentage}% Exceeded Time Pay
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {type.startsWith("hours") ? (
                <Bar 
                  dataKey="hours" 
                  fill={CHART_COLORS.hours} 
                  name="Hours"
                />
              ) : (
                <>
                  <Bar 
                    dataKey="earnings" 
                    fill={CHART_COLORS.earnings} 
                    stackId="a" 
                    name="Regular Earnings"
                  />
                  <Bar 
                    dataKey="overtime" 
                    fill={CHART_COLORS.overtime} 
                    stackId="a" 
                    name="Exceeded Time Pay"
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};