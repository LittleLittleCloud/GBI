import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DatePickerWithRange } from '@/components/data-picker';
import { DateRange } from "react-day-picker";

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
export type EnhancedMarketData = MarketData & {
    [key in `${baselineSymbolType} Price`]?: number;
} & {
    [key in `${baselineSymbolType} GBI`]?: number;
};

const MarketTrendVisualizer: React.FC<MarketTrendVisualizerProps> = ({ initialData }) => {
    const [data, setData] = useState<MarketData[]>(initialData);
    const [symbols, setSymbols] = useState<string[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState<string>('');
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const baselineSymbols: baselineSymbolType[] = ['SPY', 'QQQ', 'GLD']; // Define baseline symbols

    // Colors for the different trend lines
    const colors = {
        stock: '#2563eb', // blue
        gold: '#f59e0b',  // amber
        gbi: '#10b981',   // emerald
        spy: '#ef4444',   // red
        qqq: '#8b5cf6',   // purple
    };

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
            
            setDateRange({
                from: threeMonthsAgo,
                to: latestDate
            });

            setSymbols(uniqueSymbols as string[]);
            setSelectedSymbol(uniqueSymbols[0] as string);
            setIsLoading(false);
        }
    }, [initialData]);

    // Filter data by selected symbol and date range
    const filteredData = data.filter(item => {
        const itemDate = new Date(item.Date);
        const matchesSymbol = item['Stock Symbol'] === selectedSymbol;
        const matchesDateRange = dateRange ? 
            (!dateRange.from || itemDate >= dateRange.from) && 
            (!dateRange.to || itemDate <= dateRange.to) : 
            true;
        
        return matchesSymbol && matchesDateRange;
    });

    // Get baseline data with date range filter
    const baselineData: Record<string, MarketData[]> = {};
    baselineSymbols.forEach(symbol => {
        baselineData[symbol] = data.filter(item => {
            const itemDate = new Date(item.Date);
            const matchesSymbol = item['Stock Symbol'] === symbol;
            const matchesDateRange = dateRange ? 
                (!dateRange.from || itemDate >= dateRange.from) && 
                (!dateRange.to || itemDate <= dateRange.to) : 
                true;
            
            return matchesSymbol && matchesDateRange;
        });
    });

    // Handle symbol change
    const handleSymbolChange = (value: string) => {
        setSelectedSymbol(value);
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // Function to match dates between datasets for comparison
    const getPriceAndGBIForDate = (baselineArray: MarketData[], date: string) => {
        const match = baselineArray.find(item => item.Date === date);
        return match ? {
            price: match['Stock Price'],
            gbi: match.GBI
        } : null;
    };

    // Enhance filtered data with baseline comparisons
    const enhancedChartData = filteredData.map(item => {
        const enhancedItem: EnhancedMarketData = { ...item };

        // Add baseline values
        baselineSymbols.forEach(symbol => {
            if (baselineData[symbol] && baselineData[symbol].length) {
                const baselineValue = getPriceAndGBIForDate(baselineData[symbol], item.Date);
                if (baselineValue !== null) {
                    enhancedItem[`${symbol} Price`] = baselineValue.price;
                    enhancedItem[`${symbol} GBI`] = baselineValue.gbi;
                }
            }
        });

        return enhancedItem;
    });

    // Handle date range change
    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">GBI Visualizer</CardTitle>
                            <CardDescription>
                                <a href="https://github.com/LittleLittleCloud/GBI"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    [View GBI on GitHub]
                                </a>{" "}
                                <a href="https://github.com/LittleLittleCloud/GBI/issues"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    [Create an Issue]
                                </a>{" "}
                                <a href="https://github.com/LittleLittleCloud/GBI/issues"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    [Give US A Star]
                                </a>
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <DatePickerWithRange 
                                dateRange={dateRange} 
                                onDateRangeChange={handleDateRangeChange} 
                            />
                            <Select value={selectedSymbol} onValueChange={handleSymbolChange}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Symbol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {symbols.map(symbol => (
                                        <SelectItem key={symbol} value={symbol}>
                                            {symbol}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                <TabsList>
                                    <TabsTrigger value="all">Combined Metrics</TabsTrigger>
                                    <TabsTrigger value="absolute">Separate Metrics</TabsTrigger>
                                </TabsList>

                                <TabsContent value="all" className="pt-4">
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                title='Pirce and GBI'
                                                data={enhancedChartData}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="Date"
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value);
                                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                                    }}
                                                />
                                                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    formatter={(value, name) => [
                                                        Number(value).toFixed(2),
                                                        name === "Stock" ? selectedSymbol :
                                                            name === "Gold Price" ? "Gold" :
                                                                name === "GBI" ? `${selectedSymbol} GBI` :
                                                                    name
                                                    ]}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend />
                                                <Line
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="Stock Price"
                                                    stroke={colors.stock}
                                                    name={selectedSymbol}
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="GBI"
                                                    stroke={colors.gbi}
                                                    name={`${selectedSymbol} GBI`}
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                {/* Add baseline Price lines */}
                                                {baselineSymbols.map(symbol => (
                                                    <Line
                                                        key={symbol}
                                                        yAxisId="left"
                                                        type="monotone"
                                                        dataKey={`${symbol} Price`}
                                                        stroke={colors[symbol.toLowerCase() as keyof typeof colors]}
                                                        name={symbol}
                                                        dot={false}
                                                        strokeDasharray="5 5"
                                                        activeDot={{ r: 4 }}
                                                    />
                                                ))}

                                                {/* Add baseline GBI lines */}
                                                {baselineSymbols.map(symbol => (
                                                    <Line
                                                        key={`${symbol} GBI`}
                                                        yAxisId="right"
                                                        type="monotone"
                                                        dataKey={`${symbol} GBI`}
                                                        stroke={colors[symbol.toLowerCase() as keyof typeof colors]}
                                                        name={`${symbol} GBI`}
                                                        dot={false}
                                                        strokeDasharray="5 5"
                                                        activeDot={{ r: 4 }}
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </TabsContent>

                                <TabsContent value="absolute" className="pt-4">
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={enhancedChartData}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="Date"
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value);
                                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                                    }}
                                                />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    formatter={(value, name) => [
                                                        Number(value).toFixed(2),
                                                        name === "Stock" ? selectedSymbol :
                                                            name
                                                    ]}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="Stock Price"
                                                    stroke={colors.stock}
                                                    name={selectedSymbol}
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                {/* Add baseline lines */}
                                                {baselineSymbols.map(symbol => (
                                                    <Line
                                                        key={symbol}
                                                        type="monotone"
                                                        dataKey={`${symbol} Price`}
                                                        stroke={colors[symbol.toLowerCase() as keyof typeof colors]}
                                                        name={symbol}
                                                        dot={false}
                                                        strokeDasharray="5 5"
                                                        activeDot={{ r: 4 }}
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={enhancedChartData}
                                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="Date"
                                                    tick={{ fontSize: 12 }}
                                                    tickFormatter={(value) => {
                                                        const date = new Date(value);
                                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                                    }}
                                                />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    formatter={(value, name) => [
                                                        Number(value).toFixed(2),
                                                        name === "Stock" ? selectedSymbol :
                                                            name
                                                    ]}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="GBI"
                                                    stroke={colors.stock}
                                                    name={`${selectedSymbol} GBI`}
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                {/* Add baseline lines */}
                                                {baselineSymbols.map(symbol => (
                                                    <Line
                                                        key={symbol}
                                                        type="monotone"
                                                        dataKey={`${symbol} GBI`}
                                                        stroke={colors[symbol.toLowerCase() as keyof typeof colors]}
                                                        name={`${symbol} GBI`}
                                                        dot={false}
                                                        strokeDasharray="5 5"
                                                        activeDot={{ r: 4 }}
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
                <CardFooter className="text-sm text-gray-500">
                    <p>
                        Data sourced from market historical data.
                        Last updated: {filteredData.length > 0 ? new Date(filteredData[filteredData.length - 1].Date).toLocaleDateString() : 'N/A'}
                        <br />
                        {filteredData.length > 0 && 
                            `Showing data from ${new Date(filteredData[0].Date).toLocaleDateString()} to ${new Date(filteredData[filteredData.length - 1].Date).toLocaleDateString()}`
                        }
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default MarketTrendVisualizer;