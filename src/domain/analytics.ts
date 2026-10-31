export interface DailyActivity {
  date: string;
  newLeads: number;
  siteVisits: number;
  dealsClosed: number;
  revenuePKR: number;
}

export interface MonthlySales {
  month: string;
  revenuePKR: number;
  targetPKR: number;
  dealsClosed: number;
}
