import { clsx, type ClassValue } from "clsx";
import Papa from "papaparse";
import path from "path";
import { twMerge } from "tailwind-merge";
import fs from "fs";
import { LineData, MarketData } from "./lineDataStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function loadMarketData(): { marketData: LineData[]; symbols: string[] } {
  const filePath = path.join(
    process.cwd(),
    "assets",
    "data",
    "all_gbi_data.csv"
  );
  const fileContent = fs.readFileSync(filePath, "utf8");

  const result = Papa.parse<MarketData>(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (result.errors && result.errors.length > 0) {
    console.error("Errors parsing CSV:", result.errors);
  }

  const lineData: { [key: string]: LineData } = {};
  const symbols: string[] = [];

  for (const row of result.data) {
    const date = row.Date;
    if (!lineData[date]) {
      lineData[date] = { Date: date };
    }
    const symbol = row["Stock Symbol"];
    symbols.push(symbol);
    const priceKey = `${symbol} Price` as const;
    const gbiKey = `${symbol} GBI` as const;
    const priceValue = row["Stock Price"];
    const gbiValue = row.GBI;

    if (!lineData[date]) {
      lineData[date] = { Date: date };
    }

    lineData[date][priceKey] = priceValue;
    lineData[date][gbiKey] = gbiValue;
  }

  // Convert lineData object to array and sort by date
  const lineDataArray = Object.values(lineData).sort(
    (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
  );

  // Filter out rows with missing data
  const filteredLineData = lineDataArray.filter((row) => {
    return Object.values(row).every((value) => value !== null && value !== "");
  });

  // Remove duplicate symbols
  const uniqueSymbols = Array.from(new Set(symbols));

  return { marketData: filteredLineData, symbols: uniqueSymbols };
}
