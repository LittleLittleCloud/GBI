import { create } from "zustand";
import { marketSymbolType } from "@/lib/symbol";

interface SymbolState {
  selectedSymbols: marketSymbolType[];
  availableSymbols: marketSymbolType[];
  baselineSymbols: marketSymbolType[];
  selectedBaselineSymbols: marketSymbolType[];
  setSelectedBaselineSymbols: (symbols: marketSymbolType[]) => void;
  setSelectedSymbols: (symbols: marketSymbolType[]) => void;
  addSymbol: (symbol: marketSymbolType) => void;
  removeSymbol: (symbol: marketSymbolType) => void;
  clearSymbols: () => void;
  setAvailableSymbols: (symbols: marketSymbolType[]) => void;
}

export const useSymbolStore = create<SymbolState>((set) => ({
  selectedSymbols: [],
  setSelectedSymbols: (symbols) => set({ selectedSymbols: symbols }),
  addSymbol: (symbol) =>
    set((state) => ({
      selectedSymbols: state.selectedSymbols.includes(symbol)
        ? state.selectedSymbols
        : [...state.selectedSymbols, symbol],
    })),
  baselineSymbols: ["SPY", "QQQ", "GLD"],
  selectedBaselineSymbols: ["SPY", "QQQ", "GLD"],
  setSelectedBaselineSymbols: (symbols) => set({ selectedBaselineSymbols: symbols }),
  removeSymbol: (symbol) =>
    set((state) => ({
      selectedSymbols: state.selectedSymbols.filter((s) => s !== symbol),
    })),
  clearSymbols: () => set({ selectedSymbols: [] }),
  availableSymbols: [],
  setAvailableSymbols: (symbols) => {
    if (symbols.length > 0)
      set({ availableSymbols: symbols, selectedSymbols: [symbols[0]] });
  },
}));
