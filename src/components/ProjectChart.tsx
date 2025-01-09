import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStats } from "@/types/csv";
import { AlertTriangle } from "lucide-react";

interface ProjectChartProps {
  data: Record<string, ProjectStats>;
}

const CHART_COLORS = {
  earnings: "#2563eb",
  overtime: "#dc2626",
  warning: "#ea580c"
};

export const ProjectChart = ({ data }: ProjectChartProps) => {
  const chartData = Object.entries(data).map(([name, stats]) => ({
    name,
    earnings: Number((stats.totalEarnings - (stats.overtimePay || 0)).toFixed(2)),
    overtime: Number((stats.overtimePay || 0).toFixed(2)),
    hourlyRate: Number(stats.averageRate.toFixed(2)),
    overtimePercentage: Number(((stats.overtimePay || 0) / stats.totalEarnings * 100).toFixed(1)),
    hours: Number(stats.totalHours.toFixed(1)),
    taskCount: stats.itemCount
  }));

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Earnings by Project</CardTitle>
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
                        <p className="text-sm text-muted-foreground">
                          Average Rate: ${data.hourlyRate}/hr
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Hours Worked: {data.hours}h
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tasks Completed: {data.taskCount}
                        </p>
                        {payload.map((item) => (
                          <p key={item.name} className="text-sm">
                            {item.name === "overtime" ? "Exceeded Time Pay" : "Regular Earnings"}: ${item.value}
                          </p>
                        ))}
                        {data.overtimePercentage > 50 && (
                          <p className="text-sm text-[#dc2626] flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            {data.overtimePercentage}% Exceeded Time Pay
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};