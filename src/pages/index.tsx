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
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    console.log("Home component mounted");
  }, []);

  useEffect(() => {
    setTheme(systemTheme!);
    console.log("Theme changed to system theme", systemTheme);
  }, [systemTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <main className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      <Head>
        <title>GBI</title>
        <meta name="description" content="github page for GBI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex items-center justify-center">
        <Header />
        <DateRangeSelector />
        <SymbolSelectorCard />
      </div>
      <div>
        <MarketTrendVisualizer initialData={marketData} />
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
