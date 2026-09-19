export interface TrialSetupStep { key: string; label: string; done: boolean; }
export interface TrialDashboard {
  planName: string;
  daysRemaining: number;
  setupPercent: number;
  steps: TrialSetupStep[];
  hasData: boolean;          // whether the tenant has any real operational data yet
  sampleDataLoaded: boolean;
}
export interface DiscoveryShortcut { icon: string; label: string; route: string; }
