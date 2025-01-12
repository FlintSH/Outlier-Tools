import { ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { POPULAR_CURRENCIES } from "@/types/csv";
import { useCurrency } from "@/contexts/currency";

export function CurrencySelect() {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency, currencies, isLoading } = useCurrency();

  const popularCurrencies = currencies.filter(c => POPULAR_CURRENCIES.includes(c.code));
  const otherCurrencies = currencies.filter(c => !POPULAR_CURRENCIES.includes(c.code));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <span>{currency.code}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <div className="max-h-[300px] overflow-y-auto scrollbar-none">
            <CommandList>
              <CommandGroup heading="Popular">
                {popularCurrencies.map((curr) => (
                  <CommandItem
                    key={curr.code}
                    value={curr.code}
                    onSelect={() => {
                      setCurrency(curr);
                      setOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer",
                      currency.code === curr.code && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span>{curr.code}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="All Currencies">
                {otherCurrencies.map((curr) => (
                  <CommandItem
                    key={curr.code}
                    value={curr.code}
                    onSelect={() => {
                      setCurrency(curr);
                      setOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer",
                      currency.code === curr.code && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span>{curr.code}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 