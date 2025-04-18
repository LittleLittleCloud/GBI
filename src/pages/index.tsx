import Image from "next/image";
import localFont from "next/font/local";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import MarketTrendVisualizer, {
  MarketData,
} from "@/components/market-data-visualizer";
import exp from "constants";
import { GetStaticProps } from "next";
import { loadMarketData } from "@/lib/utils";
import { Header } from "@/components/header";
import { DateRangeSelector } from "@/components/date-range-selector";
import SymbolSelectorCard from "@/components/symbol-selector";
import {
  BaselineData,
  baselineSymbolType,
  LineData,
  useLineDataStore,
} from "@/lib/lineDataStore";
import GBIVisualizer from "@/components/gbi-visualizer";
import MarketPriceVisualizer from "@/components/market-price-visualizer";
import { useSymbolStore } from "@/lib/symbolStore";
import { useDateStore } from "@/lib/dateStore";
import { DateRange } from "react-day-picker";
import BaselineSymbolSelectorCard from "@/components/baseline-symbol-selector";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export type ProjectMetadata = {
  name: string;
  description: string;
  url?: string;
};

export default function Home({ marketData }: { marketData: MarketData[] }) {
  const [mounted, setMounted] = useState(false);
  const data: MarketData[] = useLineDataStore((state) => state.marketData); // Use Zustand store for market data
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const setMarketData = useLineDataStore((state) => state.setMarketData);
  const setLineData = useLineDataStore((state) => state.setLineData); // Use Zustand store for line data
  const selectedSymbols = useSymbolStore((state) => state.selectedSymbols); // Use Zustand store for selected symbols
  const dateRange = useDateStore<DateRange | undefined>(
    (state) => state.dateRange
  ); // Use Zustand store for date range
  const baselineSymbols = useSymbolStore((state) => state.baselineSymbols); // Define baseline symbols

  useEffect(() => {
    const lineData: { [key: string]: LineData } = baselineSymbols.reduce(
      (acc, symbol) => {
        const filteredData = data.filter(
          (item) =>
            item["Stock Symbol"] === symbol &&
            (!dateRange ||
              (new Date(item.Date) >= dateRange.from! &&
                new Date(item.Date) <= dateRange.to!))
        );
  
        for (const item of filteredData) {
          const date = item.Date;
          const priceKey = `${symbol} Price` as const;
          const gbiKey = `${symbol} GBI` as const;
          const priceValue = item["Stock Price"];
          const gbiValue = item.GBI;
  
          if (!acc[date]) {
            acc[date] = {} as LineData;
          }
          acc[date][priceKey] = priceValue;
          acc[date][gbiKey] = gbiValue;
          acc[date].Date = date; // Ensure Date is set
        }
  
        return acc;
      },
      {} as { [key: string]: LineData }
    );

    for (const symbol of selectedSymbols) {
      const filteredData = data.filter(
        (item) =>
          item["Stock Symbol"] === symbol &&
          (!dateRange ||
            (new Date(item.Date) >= dateRange.from! &&
              new Date(item.Date) <= dateRange.to!))
      );
      const symbolData: LineData[] = filteredData.map(
        (item) =>
          ({
            Date: item.Date,
            [`${symbol} Price`]: item["Stock Price"],
            [`${symbol} GBI`]: item.GBI,
          } as LineData)
      );

      // Add symbol data to lineData
      symbolData.forEach((item) => {
        if (!lineData[item.Date]) {
          lineData[item.Date] = { Date: item.Date };
        }
        lineData[item.Date][`${symbol} Price`] = item[`${symbol} Price`];
        lineData[item.Date][`${symbol} GBI`] = item[`${symbol} GBI`];
      });
    }

    // Convert lineData object to array and sort by date
    const lineDataArray = Object.values(lineData).sort(
      (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
    );
    const combinedEnhancedChartData = lineDataArray.map((item) => {
      const date = new Date(item.Date).toLocaleDateString();
      return {
        ...item,
        Date: date,
      };
    });

    console.log("Combined Enhanced Chart Data:", combinedEnhancedChartData);

    setLineData(combinedEnhancedChartData);
  }, [selectedSymbols, data, dateRange]);

  useEffect(() => {
    setMounted(true);
    console.log("Home component mounted");
    setMarketData(marketData);
  }, []);

  useEffect(() => {
    setTheme(systemTheme!);
    console.log("Theme changed to system theme", systemTheme);
  }, [systemTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <main
      className={`flex flex-col lg:flex-row ${geistSans.variable} ${geistMono.variable} font-sans`}
    >
      <Head>
        <title>GBI</title>
        <meta name="description" content="github page for GBI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col w-full lg:w-1/4 p-2 gap-2">
        <Header />
        <DateRangeSelector />
        <SymbolSelectorCard />
        <BaselineSymbolSelectorCard />
      </div>
      <div className="flex flex-col items-center justify-center flex-grow p-2 gap-2">
        <GBIVisualizer />
        <MarketPriceVisualizer />
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const marketData = loadMarketData();
  return {
    props: {
      marketData,
    },
    // Optionally revalidate the data after a certain period (in seconds)
    // revalidate: 86400, // Revalidate once per day
  };
};
