import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Currency, SUPPORTED_CURRENCIES } from "@/types/csv";
import { fetchCurrencies } from "@/lib/currencyApi";
import { useToast } from "@/components/ui/use-toast";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertAmount: (amount: number) => number;
  formatAmount: (amount: number) => string;
  currencies: Currency[];
  isLoading: boolean;
}

const DEFAULT_CURRENCY: Currency = {
  code: "USD",
  name: "US Dollar",
  symbol: "$",
  rate: 1
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [currencies, setCurrencies] = useState<Currency[]>([DEFAULT_CURRENCY]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const fetchedCurrencies = await fetchCurrencies();
        setCurrencies(fetchedCurrencies);
        const currentCurrency = fetchedCurrencies.find(c => c.code === currency.code);
        if (currentCurrency) {
          setCurrency(currentCurrency);
        }
      } catch (error) {
        toast({
          title: "Error loading currencies",
          description: "Using USD only. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrencies();
    const interval = setInterval(loadCurrencies, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertAmount = useCallback((amount: number) => {
    return amount * currency.rate;
  }, [currency.rate]);

  const formatAmount = useCallback((amount: number) => {
    const converted = convertAmount(amount);
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }, [currency.code, convertAmount]);

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        convertAmount, 
        formatAmount,
        currencies,
        isLoading
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
} 