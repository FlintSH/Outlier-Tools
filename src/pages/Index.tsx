import { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { StatsCard } from "@/components/StatsCard";
import { ProjectChart, ChartType } from "@/components/ProjectChart";
import { DistributionChart } from "@/components/DistributionChart";
import { ProjectStatsGrid } from "@/components/ProjectStatsGrid";
import { parseCSV, calculateStats, getCurrentPayCycleDates, filterItemsByDateRange } from "@/utils/csvParser";
import { DashboardStats, WorkItem } from "@/types/csv";
import { DollarSign, Clock, TrendingUp, Gift, Github, AlertCircle, Upload, Coffee, ChevronDown } from "lucide-react";
import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeProvider";
import { CurrencyProvider } from "@/contexts/currency";
import { CurrencySelect } from "@/components/CurrencySelect";
import { cn } from "@/lib/utils";

// FOR CONTRIBUTORS: Do not add to the changelog, I will do so from your PR.
const CHANGELOG = [
  {
    date: "2025-02-01",
    changes: [
      "Added a button to select a new CSV file",
    ]
  },
  {
    date: "2025-01-24",
    changes: [
      "Added project breakdown grid",
      "Projects are sorted by total hours worked",
      "Added earnings, hours and tasks to project cards",
      "Average minutes per task shown per project"
    ]
  },
  {
    date: "2025-01-17",
    changes: [
      "Exceeded time no longer adds to the task count",
      "Fixed a visual bug with the filtering buttons"
    ]
  },
  {
    date: "2024-01-12",
    changes: [
      "Added currency conversion support",
      "Fixed mission rewards not included in total earnings",
      "Whitelisted Outlier GlobalProtect traffic"
    ]
  },
  {
    date: "2024-01-09",
    changes: [
      "Added this changelog",
      "Made chart colors better",
      "Implemented dark mode",
      "Added 3 new chart filters"
    ]
  },
  {
    date: "2024-01-08", 
    changes: [
      "Initial release",
      "Added Pay Analyzer tool",
      "Added suggestion submission"
    ]
  }
];

const IndexContent = () => {
  const [allItems, setAllItems] = useState<WorkItem[] | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const { start, end } = getCurrentPayCycleDates();
    return { from: start, to: end };
  });
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chartType, setChartType] = useState<ChartType>("earningsByProject");
  const [showChangelog, setShowChangelog] = useState(false);
  const [showProjectBreakdown, setShowProjectBreakdown] = useState(false);
  const [selectCsvDialogOpen, setSelectCsvDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (allItems && dateRange?.from && dateRange?.to) {
      const filteredItems = filterItemsByDateRange(allItems, dateRange.from, dateRange.to);
      const calculatedStats = calculateStats(filteredItems);
      setStats(calculatedStats);
    }
  }, [allItems, dateRange]);

  const handleFileLoaded = (content: string) => {
    const items: WorkItem[] = parseCSV(content);
    setAllItems(items);
    setSelectCsvDialogOpen(false);
  };

  const handleCurrentPayCycle = () => {
    const { start, end } = getCurrentPayCycleDates();
    setDateRange({ from: start, to: end });
  };

  const handlePreviousPayCycle = () => {
    const { start, end } = getCurrentPayCycleDates();
    setDateRange({
      from: addDays(start, -7),
      to: addDays(end, -7)
    });
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;
    
    setIsSubmitting(true);
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
      const response = await fetch(`${serverUrl}/api/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suggestion }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit');
      }

      toast({
        title: "Suggestion Submitted",
        description: "Thank you for your feedback! Your suggestion has been received.",
      });
      setSuggestion("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit suggestion. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLifetimeStats = () => {
    if (allItems && allItems.length > 0) {
      const sortedItems = [...allItems].sort((a, b) => 
        new Date(a.workDate).getTime() - new Date(b.workDate).getTime()
      );
      
      setDateRange({
        from: new Date(sortedItems[0].workDate),
        to: new Date(sortedItems[sortedItems.length - 1].workDate)
      });
    }
  };

  const isCurrentPayCycle = () => {
    if (!dateRange?.from || !dateRange?.to) return false;
    const { start, end } = getCurrentPayCycleDates();
    return dateRange.from.getTime() === start.getTime() && dateRange.to.getTime() === end.getTime();
  };

  const isPreviousPayCycle = () => {
    if (!dateRange?.from || !dateRange?.to) return false;
    const { start, end } = getCurrentPayCycleDates();
    const prevStart = addDays(start, -7);
    const prevEnd = addDays(end, -7);
    return dateRange.from.getTime() === prevStart.getTime() && dateRange.to.getTime() === prevEnd.getTime();
  };

  const isLifetimeStats = () => {
    if (!dateRange?.from || !dateRange?.to || !allItems || allItems.length === 0) return false;
    const sortedItems = [...allItems].sort((a, b) => 
      new Date(a.workDate).getTime() - new Date(b.workDate).getTime()
    );
    const firstDate = new Date(sortedItems[0].workDate);
    const lastDate = new Date(sortedItems[sortedItems.length - 1].workDate);
    return dateRange.from.getTime() === firstDate.getTime() && dateRange.to.getTime() === lastDate.getTime();
  };

  return (
    <div className="container py-8 min-h-screen flex flex-col">
      <header className="mb-8 flex flex-col items-center">
        <div className="w-full max-w-4xl relative flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-2">Outlier Tools</h1>
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <button
              onClick={() => setShowChangelog(true)}
              className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <AlertCircle className="h-4 w-4" />
              What's New
            </button>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>by</span>
            <a
              href="https://github.com/FlintSH"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src="https://github.com/FlintSH.png" />
                <AvatarFallback>FS</AvatarFallback>
              </Avatar>
              FlintSH
            </a>
            <span>•</span>
            <a
              href="https://github.com/FlintSH/outlier-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://ko-fi.com/flintsh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Coffee className="h-4 w-4" />
              Donate
            </a>
          </div>
          <p className="mt-4 text-muted-foreground text-center max-w-2xl">
            A collection of free open-source tools to help you better understand your Outlier account, entirely handled in-browser.
          </p>
          {allItems && (
            <div className="mt-6">
              <Dialog open={selectCsvDialogOpen} onOpenChange={setSelectCsvDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Select New CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Select New CSV</DialogTitle>
                    <DialogDescription>
                      Select a new CSV file to analyze different data
                    </DialogDescription>
                  </DialogHeader>
                  <FileUpload onFileLoaded={handleFileLoaded} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </header>

      {!allItems ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto w-full px-4">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Pay Analyzer</CardTitle>
              <CardDescription>
                Analyze your earnings and hours worked with detailed statistics and visualizations, beyond what Outlier shows you.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <FileUpload onFileLoaded={handleFileLoaded} />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("help-dialog")?.click()}
                >
                  Need help finding your CSV?
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  🔒 Your earnings data is processed locally and never leaves your device
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>More Tools...</CardTitle>
              <CardDescription>
                Have an idea for a tool that would help out? Submit your suggestion below!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-3">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium">Please note:</p>
                </div>
                <div className="pl-4">
                  <p className="text-sm text-muted-foreground">
                    Suggestions that request help with cheating or violate Outlier's Terms of Use will be automatically denied. Please ensure your tool idea follows Outlier's guidelines.
                  </p>
                </div>
              </div>
              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <Textarea
                  placeholder="Describe your tool idea..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <Button 
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !suggestion.trim()}
                >
                  {isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  📜 You can find Outlier's Terms of Use <a href="https://outlier.ai/legal/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">here</a>. Please review them carefully.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={isCurrentPayCycle() ? "default" : "outline"}
                onClick={handleCurrentPayCycle}
              >
                Current Pay Cycle
              </Button>
              <Button 
                size="sm" 
                variant={isPreviousPayCycle() ? "default" : "outline"}
                onClick={handlePreviousPayCycle}
              >
                Previous Pay Cycle
              </Button>
              <Button 
                size="sm" 
                variant={isLifetimeStats() ? "default" : "outline"}
                onClick={() => handleLifetimeStats()}
              >
                Lifetime Stats
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <CurrencySelect />
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard
              title="Total Earnings"
              value={`$${stats?.totalEarnings.toFixed(2) || '0.00'}`}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <StatsCard
              title="Total Hours"
              value={`${stats?.totalHours.toFixed(1) || '0.0'}h`}
              icon={<Clock className="h-4 w-4" />}
            />
            <StatsCard
              title="Avg. Hourly Rate"
              value={`$${stats?.averageHourlyRateWithRewards.toFixed(2) || '0.00'}/hr`}
              icon={<TrendingUp className="h-4 w-4" />}
              tooltip={stats && {
                base: stats.averageHourlyRate,
                withRewards: stats.averageHourlyRateWithRewards,
              }}
            />
            <StatsCard
              title="Mission Rewards"
              value={`$${stats?.missionRewards.toFixed(2) || '0.00'}`}
              icon={<Gift className="h-4 w-4" />}
            />
          </div>
          {stats?.projectStats && (
            <div className="rounded-xl border bg-card">
              <div className="p-6">
                <ProjectChart 
                  data={stats.projectStats} 
                  type={chartType}
                  onTypeChange={setChartType}
                />
                <div className="mt-6 border-t pt-4">
                  <button
                    onClick={() => setShowProjectBreakdown(!showProjectBreakdown)}
                    className={cn(
                      "flex items-center justify-between w-full rounded-lg py-2 px-3 group",
                      !showProjectBreakdown && "bg-accent/50 hover:bg-accent/70 transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">Project Breakdown</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">NEW</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        showProjectBreakdown && "transform rotate-180"
                      )} 
                    />
                  </button>
                  <div className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    showProjectBreakdown ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <ProjectStatsGrid projectStats={stats.projectStats} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {stats?.payTypeDistribution && (
              <DistributionChart
                data={stats.payTypeDistribution}
                title="Pay Type Distribution"
                className="col-span-1"
              />
            )}
            {stats?.statusDistribution && (
              <DistributionChart
                data={stats.statusDistribution}
                title="Status Distribution"
                className="col-span-1"
              />
            )}
          </div>
        </div>
      )}

      <Dialog>
        <DialogTrigger id="help-dialog" className="hidden">Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to get started</DialogTitle>
            <DialogDescription>
              Follow these steps to analyze your Outlier earnings:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-[25px_1fr] gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">1</div>
              <p className="leading-6">
                Visit <a href="https://app.outlier.ai/en/expert/earnings" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">your Outlier earnings page</a>
              </p>
            </div>
            <div className="grid grid-cols-[25px_1fr] gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">2</div>
              <p className="leading-6">Click the "Download to CSV" button</p>
            </div>
            <div className="grid grid-cols-[25px_1fr] gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">3</div>
              <p className="leading-6">Upload the CSV file using the form above</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              What's New
            </DialogTitle>
            <DialogDescription>
              Recent updates and improvements to Outlier Tools
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {CHANGELOG.map((entry) => (
                <div key={entry.date} className="relative pl-4">
                  <div className="absolute left-0 top-0 h-full w-[2px] bg-muted" />
                  <div className="font-medium mb-2">{entry.date}</div>
                  <ul className="list-disc list-inside space-y-2">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="relative pl-4 pt-4 border-t text-sm text-muted-foreground">
                Thank you to all who <a href="https://ko-fi.com/flintsh" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">support Outlier Tools</a>!
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <footer className="mt-auto pt-8 border-t">
        <div className="container space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Outlier Tools is an independent, unofficial tool and is not affiliated with, endorsed by, or connected to Scale AI or Outlier in any way. 
            This tool is created by the community, for the community.
          </p>
        </div>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <CurrencyProvider>
      <IndexContent />
    </CurrencyProvider>
  );
};

export default Index;