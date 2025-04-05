import { MarketData } from "@/components/market-data-visualizer";
import { clsx, type ClassValue } from "clsx"
import Papa from "papaparse";
import path from "path";
import { twMerge } from "tailwind-merge"
import fs from 'fs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function loadMarketData(): MarketData[] {
    try {
      // Path is relative to project root in Next.js
      const filePath = path.join(process.cwd(), 'assets', 'data', 'all_gbi_data.csv');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      const result = Papa.parse<MarketData>(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      if (result.errors && result.errors.length > 0) {
        console.error('Errors parsing CSV:', result.errors);
      }
      
      return result.data || [];
    } catch (error) {
      console.error('Error loading market data:', error);
      return [];
    }
  }