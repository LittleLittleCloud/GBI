import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DatePickerWithRange } from "@/components/data-picker";
import { DateRange } from "react-day-picker";
import MultiSelect from "@/components/multi-selector";
import { marketSymbolType } from "@/lib/symbol";
import { useDateStore } from "@/lib/dateStore";
import { useSymbolStore } from "@/lib/symbolStore";
import {
  BaselineData,
  baselineSymbolType,
  LineData,
  MarketData,
  useLineDataStore,
} from "@/lib/lineDataStore";

const MarketTrendVisualizer: React.FC<{}> = ({}) => {
  const data: MarketData[] = useLineDataStore((state) => state.marketData); // Use Zustand store for market data
  const [isLoading, setIsLoading] = useState(true);
  const lineData = useLineDataStore((state) => state.lineData); // Use Zustand store for line data
  const setLineData = useLineDataStore((state) => state.setLineData); // Use Zustand store for line data
  const setAvailableSymbols = useSymbolStore(
    (state) => state.setAvailableSymbols
  ); // Use Zustand store for available symbols
  const selectedSymbols = useSymbolStore((state) => state.selectedSymbols); // Use Zustand store for selected symbols
  const dateRange = useDateStore<DateRange | undefined>(
    (state) => state.dateRange
  ); // Use Zustand store for date range
  const baselineSymbols: baselineSymbolType[] = ["SPY", "QQQ", "GLD"]; // Define baseline symbols

  // Colors for the different trend lines
  const baselineColors: { [key in `${baselineSymbolType}`]: string } = {
    GLD: "#f59e0b", // amber
    SPY: "#ef4444", // red
    QQQ: "#8b5cf6", // purple
  };

  // Expand colors for more stocks
  const getSymbolColor = (symbol: string, index: number) => {
    const colorOptions = [
      "#2563eb", // blue
      "#10b981", // emerald
      "#f97316", // orange
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#14b8a6", // teal
      "#84cc16", // lime
      "#6366f1", // indigo
    ];

    // Use predefined colors for baseline symbols
    if (symbol === "SPY") return baselineColors.SPY;
    if (symbol === "QQQ") return baselineColors.QQQ;
    if (symbol === "GLD") return baselineColors.GLD;

    // For other symbols, use the color array with index
    return colorOptions[index % colorOptions.length];
  };

  // Get baseline data with date range filter
  // key: date, value: BaselineData
  const baselineData: { [key: string]: BaselineData } = baselineSymbols.reduce(
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
          acc[date] = {} as BaselineData;
        }
        acc[date][priceKey] = priceValue;
        acc[date][gbiKey] = gbiValue;
        acc[date].Date = date; // Ensure Date is set
      }

      return acc;
    },
    {} as { [key: string]: BaselineData }
  );

  useEffect(() => {
    // Process the initial data
    if (data && data.length > 0) {
      // Extract unique symbols excluding baselines
      const uniqueSymbols = Array.from(
        new Set(data.map((item) => item["Stock Symbol"]))
      ).filter(
        (symbol) => !baselineSymbols.includes(symbol as baselineSymbolType)
      );

      setAvailableSymbols(uniqueSymbols as marketSymbolType[]); // Set available symbols in Zustand store
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    const lineData: { [key: string]: LineData } = baselineData;

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

  return (
      <Card className="w-full">
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading data...</p>
            </div>
          ) : (
            <div>
              <div className="h-[400px] sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="Date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                      height={30}
                      minTickGap={15}
                    />
                    <YAxis tick={{ fontSize: 10 }} width={30} />
                    <Tooltip
                      formatter={(value, name) => [
                        Number(value).toFixed(2),
                        name,
                      ]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      height={36}
                    />
                    {/* Add baseline lines */}
                    {baselineSymbols.map((symbol) => (
                      <Line
                        key={`${symbol}-price`}
                        type="monotone"
                        dataKey={`${symbol} Price`}
                        stroke={
                          baselineColors[
                            symbol.toLowerCase() as keyof typeof baselineColors
                          ]
                        }
                        name={`${symbol} Price`}
                        dot={false}
                        strokeDasharray="5 5"
                        activeDot={{ r: 4 }}
                      />
                    ))}

                    {/* Add selected symbols Price lines */}
                    {selectedSymbols.map((symbol, index) => (
                      <Line
                        key={`${symbol}-price`}
                        type="monotone"
                        dataKey={`${symbol} Price`}
                        stroke={getSymbolColor(symbol, index)}
                        name={`${symbol} Price`}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[400px] sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="Date"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                      height={30}
                      minTickGap={15}
                    />
                    <YAxis tick={{ fontSize: 10 }} width={30} />
                    <Tooltip
                      formatter={(value, name) => [
                        Number(value).toFixed(2),
                        name,
                      ]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      height={36}
                    />
                    {/* Add baseline lines */}
                    {baselineSymbols.map((symbol) => (
                      <Line
                        key={symbol}
                        type="monotone"
                        dataKey={`${symbol} GBI`}
                        stroke={
                          baselineColors[
                            symbol.toLowerCase() as keyof typeof baselineColors
                          ]
                        }
                        name={`${symbol} GBI`}
                        dot={false}
                        strokeDasharray="5 5"
                        activeDot={{ r: 4 }}
                      />
                    ))}

                    {/* Add selected symbols GBI lines */}
                    {selectedSymbols.map((symbol, index) => (
                      <Line
                        key={`${symbol}-gbi`}
                        type="monotone"
                        dataKey={`${symbol} GBI`}
                        stroke={getSymbolColor(symbol, index)}
                        name={`${symbol} GBI`}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs sm:text-sm text-gray-500">
          <div className="w-full">
            <p>
              Data sourced from market historical data.
              <br />
              Last updated:{" "}
              {lineData.length > 0
                ? new Date(
                    lineData[lineData.length - 1].Date
                  ).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="mt-1">
              {lineData.length > 0 &&
                `Showing data from ${new Date(
                  lineData[0].Date
                ).toLocaleDateString()} to ${new Date(
                  lineData[lineData.length - 1].Date
                ).toLocaleDateString()}`}
            </p>
          </div>
        </CardFooter>
      </Card>
  );
};

export default MarketTrendVisualizer;
