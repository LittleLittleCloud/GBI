import { create } from "zustand";
import { DateRange } from "react-day-picker";
import { useLineDataStore } from "./lineDataStore";

export type RangeLabel =
  | "Last 7 Days"
  | "Last 30 Days"
  | "Last 3 Months"
  | "Last 6 Months"
  | "Last Year"
  | "MTD"
  | "YTD"
  | "Full History";

export interface DateState {
  // Current date range selection
  dateRange: DateRange | undefined;

  // Predefined ranges for quick selection
  predefinedRanges: Record<
    RangeLabel,
    {
      label: RangeLabel;
      range: () => DateRange;
    }
  >;

  // Actions
  setDateRange: (range: DateRange | undefined) => void;

  // Utility methods
  getStartDate: () => Date | undefined;
  getEndDate: () => Date | undefined;
  isDateInRange: (date: Date) => boolean;
}

export const useDateStore = create<DateState>((set, get) => ({
  // Initial state
  dateRange: undefined,

  // Predefined ranges
  predefinedRanges: {
    "Last 3 Months": {
      label: "Last 3 Months",
      range: () => {
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return { from: threeMonthsAgo, to: today };
      },
    },
    "Last 6 Months": {
      label: "Last 6 Months",
      range: () => {
        const today = new Date();
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return { from: sixMonthsAgo, to: today };
      },
    },
    YTD: {
      label: "YTD",
      range: () => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return { from: startOfYear, to: today };
      },
    },
    MTD: {
      label: "MTD",
      range: () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: startOfMonth, to: today };
      },
    },
    "Last Year": {
      label: "Last Year",
      range: () => {
        const today = new Date();
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        return { from: lastYear, to: today };
      },
    },
    "Last 30 Days": {
      label: "Last 30 Days",
      range: () => {
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return { from: lastMonth, to: today };
      },
    },
    "Last 7 Days": {
      label: "Last 7 Days",
      range: () => {
        const today = new Date();
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);
        return { from: last7Days, to: today };
      },
    },
    "Full History": {
      label: "Full History",
      range: () => {
        const marketData = useLineDataStore.getState().marketData; // Assuming you have a way to get all market data
        const firstDate = new Date(marketData[0].Date);
        const lastDate = new Date(marketData[marketData.length - 1].Date);
        return { from: firstDate, to: lastDate };
      },
    },
  },

  // Actions
  setDateRange: (range) => set({ dateRange: range }),

  // Utility methods
  getStartDate: () => get().dateRange?.from,
  getEndDate: () => get().dateRange?.to,

  isDateInRange: (date) => {
    const { dateRange } = get();
    if (!dateRange || !dateRange.from || !dateRange.to) return false;

    return date >= dateRange.from && date <= dateRange.to;
  },
}));
