import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useCurrency } from "@/contexts/currency";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  tooltip?: {
    base: number;
    withRewards: number;
  };
}

export const StatsCard = ({ title, value, icon, tooltip }: StatsCardProps) => {
  const { formatAmount } = useCurrency();
  const rewardsAddition = tooltip ? (tooltip.withRewards - tooltip.base) : 0;

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') {
      if (val.startsWith('$')) {
        return formatAmount(parseFloat(val.slice(1)));
      }
      return val;
    }
    return formatAmount(val);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-primary">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2">
          {formatValue(value)}
          {tooltip && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="p-3 bg-card border rounded-lg">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-8">
                      <span className="text-sm font-medium text-muted-foreground">Base Rate</span>
                      <span className="text-sm">{formatAmount(tooltip.base)}/hr</span>
                    </div>
                    <div className="flex justify-between items-center gap-8">
                      <span className="text-sm font-medium text-muted-foreground">Missions</span>
                      <span className="text-sm text-green-500">+{formatAmount(rewardsAddition)}/hr</span>
                    </div>
                    <div className="flex justify-between items-center gap-8">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm font-medium">{formatAmount(tooltip.withRewards)}/hr</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
};