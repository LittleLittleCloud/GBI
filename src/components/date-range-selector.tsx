import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RangeLabel, useDateStore } from "@/lib/dateStore";
import { useLineDataStore } from "@/lib/lineDataStore";

interface DateRangeSelectorProps {
  className?: string;
  title?: string;
}

export function DateRangeSelector({
  className,
  title = "Date Range",
}: DateRangeSelectorProps) {
  const { dateRange, setDateRange, predefinedRanges } = useDateStore();

  const [activeTab, setActiveTab] = React.useState<
    "slider" | "calendar" | "predefined"
  >("predefined");
  const [activeRangeLabel, setActiveRangeLabel] =
    React.useState<RangeLabel>("YTD");
  const [sliderValue, setSliderValue] = React.useState<number>(30); // Default to 30 days
  const lineData = useLineDataStore((state) => state.lineData); // Use Zustand store for line data
  const marketData = useLineDataStore((state) => state.marketData); // Use Zustand store for market data
  React.useEffect(() => {
    // Set the initial date range based on the active range label
    const initialRange = predefinedRanges[activeRangeLabel]?.range();
    if (initialRange) {
      setDateRange(initialRange);
    }
  }, []);
  // Format the current date range for display
  const formattedDateRange = React.useMemo(() => {
    if (!dateRange?.from) {
      return "Select date range";
    }

    if (dateRange.to) {
      return `${format(dateRange.from, "LLL dd, yyyy")} - ${format(
        dateRange.to,
        "LLL dd, yyyy"
      )}`;
    }

    return format(dateRange.from, "LLL dd, yyyy");
  }, [dateRange]);

  // Handle slider changes
  const handleSliderChange = React.useCallback(
    (value: number[]) => {
      const days = value[0];
      setSliderValue(days);

      const today = new Date();
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - days);

      setDateRange({
        from: new Date(marketData[marketData.length - days].Date),
        to: new Date(marketData[marketData.length - 1].Date),
      });
    },
    [setDateRange]
  );

  // Apply a predefined range
  const applyPredefinedRange = React.useCallback(
    (key: RangeLabel) => {
      const range = predefinedRanges[key]?.range();
      if (range) {
        setDateRange(range);
      }
      setActiveRangeLabel(key);
    },
    [predefinedRanges, setDateRange]
  );

  const quickRangeButtons: RangeLabel[] = Object.keys(
    predefinedRanges
  ) as RangeLabel[];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Select date range</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current date range display - TOP */}
          <div className="text-sm bg-muted p-3 rounded-md font-medium">
            {formattedDateRange}
          </div>

          {/* Selector tabs - BOTTOM */}
          <Tabs
            defaultValue="slider"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as `slider` | `calendar` | `predefined`)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="predefined">Predefined</TabsTrigger>
              <TabsTrigger value="slider">Slider</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="predefined" className="space-y-3 mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>{activeRangeLabel}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="Search time range..." />
                    <CommandList>
                      <CommandEmpty>No range found.</CommandEmpty>
                      <CommandGroup>
                        {quickRangeButtons.map((btn) => (
                          <CommandItem
                            key={btn}
                            value={btn}
                            onSelect={() => {
                              applyPredefinedRange(btn as RangeLabel);
                            }}
                          >
                            <span
                              className={
                                activeRangeLabel === btn ? "font-medium" : ""
                              }
                            >
                              {btn}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </TabsContent>

            <TabsContent value="slider" className="space-y-3 mt-2">
              <div>
                <Label
                  htmlFor="date-range-slider"
                  className="text-xs text-muted-foreground mb-1 block"
                >
                  Days back from today:{" "}
                  <span className="font-medium">{sliderValue}</span>
                </Label>
                <Slider
                  id="date-range-slider"
                  defaultValue={[sliderValue]}
                  value={[sliderValue]}
                  min={1}
                  max={marketData.length}
                  step={1}
                  onValueChange={handleSliderChange}
                  className="py-3"
                />
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-3 mt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>{formattedDateRange}</span>
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="text-xs sm:text-sm text-gray-500">
        <div className="w-full">
          <p>
            Last updated:{" "}
            {lineData.length > 0
              ? new Date(
                  lineData[lineData.length - 1].Date
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
