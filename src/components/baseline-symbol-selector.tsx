import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MultiSelect from '@/components/multi-selector';
import { marketSymbolType } from '@/lib/symbol';
import { useSymbolStore } from '@/lib/symbolStore';
import { cn } from '@/lib/utils';

interface SymbolSelectorCardProps {
  className?: string;
}

const BaselineSymbolSelectorCard: React.FC<SymbolSelectorCardProps> = ({ className }) => {
  const baselineSymbols = useSymbolStore((state) => state.baselineSymbols);
  const selectedSymbols = useSymbolStore((state) => state.selectedBaselineSymbols);
    const setSelectedSymbols = useSymbolStore((state) => state.setSelectedBaselineSymbols);

  const handleSymbolChange = (value: string[]) => {
    setSelectedSymbols(value as marketSymbolType[]);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Baseline Symbol Selection</CardTitle>
        <CardDescription>Select baseline stocks to visualize</CardDescription>
      </CardHeader>
      <CardContent>
        <MultiSelect
          values={selectedSymbols}
          options={baselineSymbols.map(symbol => ({ label: symbol, value: symbol }))}
          onValueChange={handleSymbolChange}
          placeholder="Select symbols"
          className="w-full"
        />
      </CardContent>
    </Card>
  );
};

export default BaselineSymbolSelectorCard;