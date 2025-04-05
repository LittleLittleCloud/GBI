import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  values: string[];
  options: Option[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  values,
  options,
  onValueChange,
  placeholder = "Select items",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    onValueChange(values.filter((v) => v !== value));
  };

  const handleSelect = (value: string) => {
    if (values.includes(value)) {
      onValueChange(values.filter((v) => v !== value));
    } else {
      onValueChange([...values, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`flex min-h-10 h-auto flex-wrap gap-1 py-1 ${className}`}
        >
          {values.length > 0 ? (
            values.map((value) => (
              <Badge
                key={value}
                variant="secondary"
                className="flex items-center gap-1 px-2"
              >
                {options.find((option) => option.value === value)?.label || value}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(value);
                  }}
                />
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search symbols..." />
          <CommandEmpty>No symbol found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => {
              const isSelected = values.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div
                    className={`mr-2 h-4 w-4 rounded-sm border ${
                      isSelected ? "bg-primary border-primary" : "border-muted"
                    }`}
                  >
                    {isSelected && <span className="text-xs text-white flex justify-center">✓</span>}
                  </div>
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}