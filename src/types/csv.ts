export interface WorkItem {
  workDate: Date;
  itemID: string;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  rateApplied: number;
  payout: number;
  payType: string;
  projectName: string;
  status: string;
}

export interface ProjectStats {
  totalEarnings: number;
  totalHours: number;
  averageRate: number;
  itemCount: number;
  overtimePay: number;
  items: WorkItem[];
}

export interface DashboardStats {
  totalEarnings: number;
  totalHours: number;
  averageHourlyRate: number;
  averageHourlyRateWithRewards: number;
  missionRewards: number;
  projectStats: Record<string, ProjectStats>;
  payTypeDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export const POPULAR_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "AUD"
];

export const SUPPORTED_CURRENCIES: Currency[] = [];