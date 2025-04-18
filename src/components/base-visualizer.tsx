import React from "react";
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
import {
  baselineSymbolType,
  LineData,
  useIsLoadingStore,
  useLineDataStore,
} from "@/lib/lineDataStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSymbolStore } from "@/lib/symbolStore";

interface BaseVisualizerProps {
  dataKeyField: string;
  title: string;
}

const BaseVisualizer: React.FC<BaseVisualizerProps> = ({
  dataKeyField,
  title,
}) => {
  const lineData = useLineDataStore((state) => state.lineData);
  const selectedSymbols = useSymbolStore((state) => state.selectedSymbols);
  const isLoading = useIsLoadingStore((state) => state.isLoading);
    const baselineSymbols = useSymbolStore((state) => state.selectedBaselineSymbols);
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
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
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
                formatter={(value, name) => [Number(value).toFixed(2), name]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
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
                  key={`${symbol}-${dataKeyField}`}
                  type="monotone"
                  dataKey={`${symbol} ${dataKeyField}`}
                  stroke={baselineColors[symbol as keyof typeof baselineColors]}
                  name={`${symbol} ${dataKeyField}`}
                  dot={false}
                  strokeDasharray="5 5"
                  activeDot={{ r: 4 }}
                />
              ))}

              {/* Add selected symbols lines */}
              {selectedSymbols.map((symbol, index) => (
                <Line
                  key={`${symbol}-${dataKeyField}`}
                  type="monotone"
                  dataKey={`${symbol} ${dataKeyField}`}
                  stroke={getSymbolColor(symbol, index)}
                  name={`${symbol} ${dataKeyField}`}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BaseVisualizer;
