import { create } from 'zustand';
import { marketSymbolType } from '@/lib/symbol';

interface SymbolState {
  selectedSymbols: marketSymbolType[];
  availableSymbols: marketSymbolType[];
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
        : [...state.selectedSymbols, symbol]
    })),
  removeSymbol: (symbol) => 
    set((state) => ({
      selectedSymbols: state.selectedSymbols.filter((s) => s !== symbol)
    })),
  clearSymbols: () => set({ selectedSymbols: [] }),
availableSymbols: [],
    setAvailableSymbols: (symbols) => set({ availableSymbols: symbols }),
}));