import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatePickerWithRange } from '@/components/data-picker';
import { DateRange } from "react-day-picker";
import MultiSelect from '@/components/multi-selector';
import { marketSymbolType } from '@/lib/symbol';

// TypeScript interface for our data
export interface MarketData {
    Date: string;
    'Stock Price': number;
    'Gold Price': number;
    GBI: number;
    'Stock Symbol': string;
}

interface MarketTrendVisualizerProps {
    initialData: MarketData[];
}

export type baselineSymbolType = 'SPY' | 'QQQ' | 'GLD'; // Define baseline symbols

export type BaselineData = {
    Date: string;
} &
{
    [key in `${baselineSymbolType} Price` | `${baselineSymbolType} GBI`]: number;
};

export type LineData = {
    Date: string;
} & {
    [key in `${marketSymbolType} Price` | `${marketSymbolType} GBI`]?: number;
};

const MarketTrendVisualizer: React.FC<MarketTrendVisualizerProps> = ({ initialData }) => {
    const [data, setData] = useState<MarketData[]>(initialData);
    const [symbols, setSymbols] = useState<string[]>([]);
    const [selectedSymbols, setSelectedSymbols] = useState<marketSymbolType[]>([]);  // Changed from selectedSymbol
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [lineData, setLineData] = useState<LineData[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const baselineSymbols: baselineSymbolType[] = ['SPY', 'QQQ', 'GLD']; // Define baseline symbols

    // Colors for the different trend lines
    const baselineColors: { [key in `${baselineSymbolType}`]: string } = {
        "GLD": '#f59e0b',  // amber
        "SPY": '#ef4444',   // red
        "QQQ": '#8b5cf6',   // purple
    };

    // Expand colors for more stocks
    const getSymbolColor = (symbol: string, index: number) => {
        const colorOptions = [
            '#2563eb', // blue
            '#10b981', // emerald
            '#f97316', // orange
            '#8b5cf6', // purple
            '#ec4899', // pink
            '#14b8a6', // teal
            '#84cc16', // lime
            '#6366f1', // indigo
        ];

        // Use predefined colors for baseline symbols
        if (symbol === 'SPY') return baselineColors.SPY
        if (symbol === 'QQQ') return baselineColors.QQQ
        if (symbol === 'GLD') return baselineColors.GLD;

        // For other symbols, use the color array with index
        return colorOptions[index % colorOptions.length];
    };

    // Get baseline data with date range filter
    // key: date, value: BaselineData
    const baselineData: { [key: string]: BaselineData } = baselineSymbols.reduce((acc, symbol) => {
        const filteredData = data.filter(item => item['Stock Symbol'] === symbol && (!dateRange || (new Date(item.Date) >= dateRange.from! && new Date(item.Date) <= dateRange.to!)));

        for (const item of filteredData) {
            const date = item.Date;
            const priceKey = `${symbol} Price` as const;
            const gbiKey = `${symbol} GBI` as const;
            const priceValue = item['Stock Price'];
            const gbiValue = item.GBI;

            if (!acc[date]) {
                acc[date] = {} as BaselineData;
            }
            acc[date][priceKey] = priceValue;
            acc[date][gbiKey] = gbiValue;
            acc[date].Date = date; // Ensure Date is set


        }

        return acc;
    }
        , {} as { [key: string]: BaselineData });


    useEffect(() => {
        // Process the initial data
        if (initialData && initialData.length > 0) {
            // Extract unique symbols excluding baselines
            const uniqueSymbols = Array.from(
                new Set(initialData.map(item => item['Stock Symbol']))
            ).filter(symbol => !baselineSymbols.includes(symbol as baselineSymbolType));

            // Set default date range (last 3 months)
            const dates = initialData.map(item => new Date(item.Date));
            const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
            const threeMonthsAgo = new Date(latestDate);
            threeMonthsAgo.setMonth(latestDate.getMonth() - 3);
            
            console.log("Latest Date:", latestDate.toLocaleDateString());
            console.log("Three Months Ago:", threeMonthsAgo.toLocaleDateString());
            setDateRange({
                from: threeMonthsAgo,
                to: latestDate
            });

            setSymbols(uniqueSymbols as marketSymbolType[]);
            // Default select only the first symbol
            setSelectedSymbols([uniqueSymbols[0] as marketSymbolType]);
            setIsLoading(false);
        }
    }, [initialData]);

    useEffect(() => {
        const lineData: { [key: string]: LineData } = baselineData;

        for (const symbol of selectedSymbols) {
            const filteredData = data.filter(item => item['Stock Symbol'] === symbol && (!dateRange || (new Date(item.Date) >= dateRange.from! && new Date(item.Date) <= dateRange.to!)));
            const symbolData: LineData[] = filteredData.map(item => ({
                Date: item.Date,
                [`${symbol} Price`]: item['Stock Price'],
                [`${symbol} GBI`]: item.GBI,
            } as LineData));

            // Add symbol data to lineData
            symbolData.forEach(item => {
                if (!lineData[item.Date]) {
                    lineData[item.Date] = { Date: item.Date };
                }
                lineData[item.Date][`${symbol} Price`] = item[`${symbol} Price`];
                lineData[item.Date][`${symbol} GBI`] = item[`${symbol} GBI`];
            });
        }

        // Convert lineData object to array and sort by date
        const lineDataArray = Object.values(lineData).sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
        const combinedEnhancedChartData = lineDataArray.map(item => {
            const date = new Date(item.Date).toLocaleDateString();
            return {
                ...item,
                Date: date,
            };
        });

        console.log("Combined Enhanced Chart Data:", combinedEnhancedChartData);

        setLineData(combinedEnhancedChartData);
    }, [selectedSymbols, data, dateRange, baselineData]);




    // Handle symbol selection
    const handleSymbolChange = (value: string[]) => {
        setSelectedSymbols(value as marketSymbolType[]);
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };


    // Handle date range change
    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full">
                <CardHeader>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-2xl">GBI Visualizer</CardTitle>
                            <CardDescription className="flex flex-wrap gap-2">
                                <a href="https://github.com/LittleLittleCloud/GBI?tab=readme-ov-file#what-is-gbi-gold-base-index"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    [What is GBI?]
                                </a>
                                <a href="https://github.com/LittleLittleCloud/GBI/issues"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    [Create an Issue]
                                </a>
                                <a href="https://github.com/LittleLittleCloud/GBI"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    [Give US A Star]
                                </a>
                            </CardDescription>
                        </div>
                        <div className="flex flex-col space-y-3 w-full sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                            <DatePickerWithRange
                                dateRange={dateRange}
                                onDateRangeChange={handleDateRangeChange}
                                className="w-full sm:w-auto"
                            />
                            <MultiSelect
                                values={selectedSymbols}
                                options={symbols.map(symbol => ({ label: symbol, value: symbol }))}
                                onValueChange={handleSymbolChange}
                                placeholder="Select symbols"
                                className="w-full sm:w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <p>Loading data...</p>
                        </div>
                    ) : (
                        <div>
                            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-4">
                                <TabsList className="w-full grid grid-cols-2">
                                    <TabsTrigger value="all">Combined Metrics</TabsTrigger>
                                    <TabsTrigger value="absolute">Separate Metrics</TabsTrigger>
                                </TabsList>

                                <TabsContent value="all" className="pt-4">
                                    <div className="h-[400px] sm:h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                title='Price and GBI'
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
                                                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10 }} width={30} />
                                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} width={30} />
                                                <Tooltip 
                                                    formatter={(value, name) => [
                                                        Number(value).toFixed(2),
                                                        name,
                                                    ]}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend 
                                                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                                                    layout="horizontal"
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    height={36}
                                                />
                                                {/* Add baseline Price lines */}
                                                {baselineSymbols.map(symbol => (
                                                    <>
                                                        <Line
                                                            key={symbol}
                                                            yAxisId="left"
                                                            type="monotone"
                                                            dataKey={`${symbol} Price`}
                                                            stroke={baselineColors[symbol.toLowerCase() as keyof typeof baselineColors]}
                                                            name={`${symbol} Price`}
                                                            dot={false}
                                                            strokeDasharray="5 5"
                                                            activeDot={{ r: 4 }}
                                                        />
                                                        <Line
                                                            key={`${symbol} GBI`}
                                                            yAxisId="right"
                                                            type="monotone"
                                                            dataKey={`${symbol} GBI`}
                                                            stroke={baselineColors[symbol.toLowerCase() as keyof typeof baselineColors]}
                                                            name={`${symbol} GBI`}
                                                            dot={false}
                                                            strokeDasharray="5 5"
                                                            activeDot={{ r: 4 }}
                                                        />
                                                    </>
                                                ))}

                                                {/* Add selected symbols Price lines */}
                                                {selectedSymbols.map((symbol, index) => (
                                                    <Line
                                                        key={`${symbol}-price`}
                                                        yAxisId="left"
                                                        type="monotone"
                                                        dataKey={`${symbol} Price`}
                                                        stroke={getSymbolColor(symbol, index)}
                                                        name={`${symbol} Price`}
                                                        dot={false}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                ))}

                                                {/* Add selected symbols GBI lines */}
                                                {selectedSymbols.map((symbol, index) => (
                                                    <Line
                                                        key={`${symbol}-gbi`}
                                                        yAxisId="right"
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
                                </TabsContent>

                                <TabsContent value="absolute" className="pt-4">
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
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend 
                                                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                                                    layout="horizontal"
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    height={36}
                                                />
                                                {/* Add baseline lines */}
                                                {baselineSymbols.map(symbol => (
                                                    <Line
                                                        key={`${symbol}-price`}
                                                        type="monotone"
                                                        dataKey={`${symbol} Price`}
                                                        stroke={baselineColors[symbol.toLowerCase() as keyof typeof baselineColors]}
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
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend 
                                                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                                                    layout="horizontal"
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    height={36}
                                                />
                                                {/* Add baseline lines */}
                                                {baselineSymbols.map(symbol => (
                                                    <Line
                                                        key={symbol}
                                                        type="monotone"
                                                        dataKey={`${symbol} GBI`}
                                                        stroke={baselineColors[symbol.toLowerCase() as keyof typeof baselineColors]}
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
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="text-xs sm:text-sm text-gray-500">
                    <div className="w-full">
                        <p>
                            Data sourced from market historical data.
                            <br />
                            Last updated: {lineData.length > 0 ? new Date(lineData[lineData.length - 1].Date).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="mt-1">
                            {lineData.length > 0 &&
                                `Showing data from ${new Date(lineData[0].Date).toLocaleDateString()} to ${new Date(lineData[lineData.length - 1].Date).toLocaleDateString()}`
                            }
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default MarketTrendVisualizer;