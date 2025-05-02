import { create } from "zustand";
import { marketSymbolType } from "./symbol";
import { useSymbolStore } from "./symbolStore";

export interface MarketData {
  Date: string;
  "Stock Price": number;
  "Gold Price": number;
  GBI: number;
  "Stock Symbol": string;
}

export interface IsLoadingState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}
export const useIsLoadingStore = create<IsLoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

interface LineDataState {
  marketData: LineData[];
  setMarketData: (data: LineData[]) => void;
  clearMarketData: () => void;
  lineData: LineData[];
  setLineData: (data: LineData[]) => void;
  clearLineData: () => void;
}

export const useLineDataStore = create<LineDataState>((set) => ({
  lineData: [],
  marketData: [],
  setMarketData: (data) => {
    useIsLoadingStore.getState().setIsLoading(true);
    set({ marketData: data });
    // // set symbols
    // const symbols = data.map((item) => item["Stock Symbol"]);
    // const uniqueSymbols = Array.from(new Set(symbols));
    // useSymbolStore.getState().setAvailableSymbols(uniqueSymbols as marketSymbolType[]);
    useIsLoadingStore.getState().setIsLoading(false);
  },
  clearMarketData: () => set({ marketData: [] }),
  setLineData: (data) => set({ lineData: data }),
  clearLineData: () => set({ lineData: [] }),
}));

export type baselineSymbolType = "SPY" | "QQQ" | "GLD"; // Define baseline symbols

export type BaselineData = {
  Date: string;
} & {
  [key in `${baselineSymbolType} Price` | `${baselineSymbolType} GBI`]: number;
};

export type LineData = {
  Date: string;
} & {
  [key in `${marketSymbolType} Price` | `${marketSymbolType} GBI`]?: number;
};
