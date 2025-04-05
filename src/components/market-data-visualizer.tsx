import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const MarketTrendVisualizer: React.FC<MarketTrendVisualizerProps> = ({ initialData }) => {
    const [data, setData] = useState<MarketData[]>(initialData);
    const [symbols, setSymbols] = useState<string[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState<string>('');
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // Colors for the different trend lines
    const colors = {
        stock: '#2563eb', // blue
        gold: '#f59e0b',  // amber
        gbi: '#10b981',   // emerald
    };

    useEffect(() => {
        // Process the initial data
        if (initialData && initialData.length > 0) {
            // Extract unique symbols
            const uniqueSymbols = Array.from(new Set(initialData.map(item => item['Stock Symbol'])));

            setSymbols(uniqueSymbols);
            setSelectedSymbol(uniqueSymbols[0]);
            setIsLoading(false);
        }
    }, [initialData]);

    // Filter data by selected symbol
    const filteredData = data.filter(item => item['Stock Symbol'] === selectedSymbol);

    // Normalize data for better visualization
    const normalizedData = filteredData.map(item => {
        const stockPrice = item['Stock Price'];
        const goldPrice = item['Gold Price'];
        const gbi = item.GBI;

        // Calculate the initial value for each metric (based on the first day)
        const initialStockPrice = filteredData[0]['Stock Price'];
        const initialGoldPrice = filteredData[0]['Gold Price'];
        const initialGBI = filteredData[0].GBI;

        return {
            ...item,
            normalizedStockPrice: (stockPrice / initialStockPrice) * 100,
            normalizedGoldPrice: (goldPrice / initialGoldPrice) * 100,
            normalizedGBI: (gbi / initialGBI) * 100
        };
    });

    // Handle symbol change
    const handleSymbolChange = (value: string) => {
        setSelectedSymbol(value);
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Market Trend Visualization</CardTitle>
                            <CardDescription>
                                Compare stock prices, gold prices, and GBI index over time
                            </CardDescription>
                        </div>
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
                                    <TabsTrigger value="all">All Metrics</TabsTrigger>
                                    <TabsTrigger value="absolute">Absolute Values</TabsTrigger>
                                    <TabsTrigger value="normalized">Normalized Values</TabsTrigger>
                                </TabsList>

                                <TabsContent value="all" className="pt-4">
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={filteredData}
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
                                                        name === "Stock Price" ? "Stock" : name === "Gold Price" ? "Gold" : "GBI"
                                                    ]}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend />
                                                <Line
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="Stock Price"
                                                    stroke={colors.stock}
                                                    name="Stock"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    yAxisId="left"
                                                    type="monotone"
                                                    dataKey="Gold Price"
                                                    stroke={colors.gold}
                                                    name="Gold"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="GBI"
                                                    stroke={colors.gbi}
                                                    name="GBI"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </TabsContent>

                                <TabsContent value="absolute" className="pt-4">
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={filteredData}
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
                                                        name === "Stock Price" ? "Stock" : name === "Gold Price" ? "Gold" : "GBI"
                                                    ]}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="Stock Price"
                                                    stroke={colors.stock}
                                                    name="Stock"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={filteredData}
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
                                                        formatter={(value) => [Number(value).toFixed(2), "Gold"]}
                                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                    />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="Gold Price"
                                                        stroke={colors.gold}
                                                        name="Gold"
                                                        dot={false}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={filteredData}
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
                                                        formatter={(value) => [Number(value).toFixed(4), "GBI"]}
                                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                    />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="GBI"
                                                        stroke={colors.gbi}
                                                        name="GBI"
                                                        dot={false}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="normalized" className="pt-4">
                                    <div className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={normalizedData}
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
                                                <YAxis
                                                    tick={{ fontSize: 12 }}
                                                    domain={['dataMin - 1', 'dataMax + 1']}
                                                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                                                />
                                                <Tooltip
                                                    formatter={(value, name) => [
                                                        `${Number(value).toFixed(2)}%`,
                                                        name === "normalizedStockPrice" ? "Stock" : name === "normalizedGoldPrice" ? "Gold" : "GBI"
                                                    ]}
                                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                                />
                                                <Legend
                                                    formatter={(value) => {
                                                        if (value === "normalizedStockPrice") return "Stock";
                                                        if (value === "normalizedGoldPrice") return "Gold";
                                                        if (value === "normalizedGBI") return "GBI";
                                                        return value;
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="normalizedStockPrice"
                                                    stroke={colors.stock}
                                                    name="normalizedStockPrice"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="normalizedGoldPrice"
                                                    stroke={colors.gold}
                                                    name="normalizedGoldPrice"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="normalizedGBI"
                                                    stroke={colors.gbi}
                                                    name="normalizedGBI"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="text-sm text-gray-500">
                    <p>Data sourced from market historical data. Last updated: {filteredData.length > 0 ? new Date(filteredData[filteredData.length - 1].Date).toLocaleDateString() : 'N/A'}</p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default MarketTrendVisualizer;