import Image from "next/image";
import localFont from "next/font/local";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
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
  MarketData,
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

export default function Home({ marketData, symbols }: { marketData: LineData[], symbols: string[] }) {
  const [mounted, setMounted] = useState(false);
  const data: LineData[] = useLineDataStore((state) => state.marketData); // Use Zustand store for market data
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const setMarketData = useLineDataStore((state) => state.setMarketData);
  const setLineData = useLineDataStore((state) => state.setLineData); // Use Zustand store for line data
  const dateRange = useDateStore<DateRange | undefined>(
    (state) => state.dateRange
  ); // Use Zustand store for date range

  const setSymbols = useSymbolStore((state) => state.setAvailableSymbols);
  const baselineSymbols = useSymbolStore(state => state.baselineSymbols);

  useEffect(() => {
    const filteredData = data.filter(
      (item) =>
        (!dateRange ||
          (new Date(item.Date) >= dateRange.from! &&
            new Date(item.Date) <= dateRange.to!))
    );

    setLineData(filteredData);
  }, [data, dateRange]);

  useEffect(() => {
    setMounted(true);
    console.log("Home component mounted");
    setMarketData(marketData);
    const symbolsWithoutBaseSymblols = symbols.filter(
      (symbol) => !baselineSymbols.includes(symbol as baselineSymbolType)
    );
    setSymbols(symbolsWithoutBaseSymblols);
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
      ...marketData,
    },
    // Optionally revalidate the data after a certain period (in seconds)
    // revalidate: 86400, // Revalidate once per day
  };
};
