import { WorkItem, DashboardStats, ProjectStats } from "@/types/csv";

export const parseDuration = (duration: string): { hours: number; minutes: number; seconds: number; totalSeconds: number } => {
  const parts = duration.replace(/"/g, '').split(" ");
  let hours = 0, minutes = 0, seconds = 0;

  parts.forEach(part => {
    if (part.includes("h")) hours = parseInt(part);
    if (part.includes("m")) minutes = parseInt(part);
    if (part.includes("s")) seconds = parseInt(part);
  });

  const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  return { hours, minutes, seconds, totalSeconds };
};

export const parseRate = (rate: string): number => {
  return parseFloat(rate.replace(/"/g, '').replace("$", "").replace("/hr", ""));
};

export const parsePayout = (payout: string): number => {
  return parseFloat(payout.replace(/"/g, '').replace("$", ""));
};

export const parseWorkDate = (date: string): Date => {
  return new Date(date.replace(/"/g, ''));
};

export const getCurrentPayCycleDates = (): { start: Date; end: Date } => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const currentHour = now.getHours();

  const start = new Date(now);
  
  // Adjust to previous Monday 7 PM CST
  const daysToSubtract = (currentDay + 6) % 7; // Days back to previous Monday
  start.setDate(start.getDate() - daysToSubtract);
  start.setHours(19, 0, 0, 0); // 7 PM CST

  // If current time is before Monday 7 PM, adjust back one more week
  if (currentDay === 1 && currentHour < 19) {
    start.setDate(start.getDate() - 7);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setHours(18, 59, 59, 999); // 6:59:59.999 PM CST

  return { start, end };
};

export const filterItemsByDateRange = (items: WorkItem[], start: Date, end: Date): WorkItem[] => {
  return items.filter(item => {
    const workDate = new Date(item.workDate);
    return workDate >= start && workDate <= end;
  });
};

export const parseCSV = (content: string): WorkItem[] => {
  const lines = content.split("\n");
  
  // Skip header row and empty lines
  return lines
    .slice(1)
    .filter(line => line.trim())
    .map(line => {
      // Split by comma but handle cases where there might be commas within quotes
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => 
        v.trim().replace(/^"(.*)"$/, '$1')  // Remove surrounding quotes
      ) || [];
      
      // Map CSV columns to WorkItem properties
      return {
        workDate: parseWorkDate(values[0]),
        itemID: values[1],
        duration: parseDuration(values[2]),
        rateApplied: parseRate(values[3]),
        payout: parsePayout(values[4]),
        payType: values[5],
        projectName: values[6],
        status: values[7]
      };
    });
};

export const calculateStats = (items: WorkItem[]): DashboardStats => {
  const projectStats: Record<string, ProjectStats> = {};
  const payTypeDistribution: Record<string, number> = {};
  const statusDistribution: Record<string, number> = {};
  
  let totalEarnings = 0;
  let totalSeconds = 0;
  let missionRewards = 0;

  items.forEach(item => {
    if (item.payType === "missionReward") {
      missionRewards += item.payout;
      payTypeDistribution[item.payType] = (payTypeDistribution[item.payType] || 0) + 1;
      return;
    }

    // Regular earnings calculations (excluding mission rewards)
    totalEarnings += item.payout;
    totalSeconds += item.duration.totalSeconds;

    // Project stats
    if (!projectStats[item.projectName]) {
      projectStats[item.projectName] = {
        totalEarnings: 0,
        totalHours: 0,
        averageRate: 0,
        itemCount: 0,
        overtimePay: 0,
        items: items.filter(i => i.projectName === item.projectName)
      };
    }

    projectStats[item.projectName].totalEarnings += item.payout;
    projectStats[item.projectName].totalHours += item.duration.totalSeconds / 3600;
    projectStats[item.projectName].itemCount += 1;

    if (item.payType === "overtimePay") {
      projectStats[item.projectName].overtimePay += item.payout;
    }

    // Pay type distribution
    payTypeDistribution[item.payType] = (payTypeDistribution[item.payType] || 0) + 1;

    // Status distribution
    statusDistribution[item.status] = (statusDistribution[item.status] || 0) + 1;
  });

  // Calculate average rates for projects
  Object.keys(projectStats).forEach(project => {
    projectStats[project].averageRate = 
      (projectStats[project].totalEarnings - projectStats[project].overtimePay) / 
      (projectStats[project].totalHours || 1);
  });

  const totalHours = totalSeconds / 3600;
  const regularEarnings = Object.values(projectStats).reduce(
    (sum, stats) => sum + (stats.totalEarnings - stats.overtimePay), 
    0
  );
  
  return {
    totalEarnings: totalEarnings + missionRewards,
    totalHours,
    averageHourlyRate: regularEarnings / (totalHours || 1),
    averageHourlyRateWithRewards: (regularEarnings + missionRewards) / (totalHours || 1),
    missionRewards,
    projectStats,
    payTypeDistribution,
    statusDistribution
  };
};