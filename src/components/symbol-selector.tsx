import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MultiSelect from '@/components/multi-selector';
import { marketSymbolType } from '@/lib/symbol';
import { useSymbolStore } from '@/lib/symbolStore';
import { cn } from '@/lib/utils';

interface SymbolSelectorCardProps {
  className?: string;
}

const SymbolSelectorCard: React.FC<SymbolSelectorCardProps> = ({ className }) => {
  const selectedSymbols = useSymbolStore((state) => state.selectedSymbols);
  const setSelectedSymbols = useSymbolStore((state) => state.setSelectedSymbols);
  const availableSymbols = useSymbolStore((state) => state.availableSymbols);

  const handleSymbolChange = (value: string[]) => {
    setSelectedSymbols(value as marketSymbolType[]);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Symbol Selection</CardTitle>
        <CardDescription>Select stocks to visualize</CardDescription>
      </CardHeader>
      <CardContent>
        <MultiSelect
          values={selectedSymbols}
          options={availableSymbols.map(symbol => ({ label: symbol, value: symbol }))}
          onValueChange={handleSymbolChange}
          placeholder="Select symbols"
          className="w-full"
        />
      </CardContent>
    </Card>
  );
};

export default SymbolSelectorCard;