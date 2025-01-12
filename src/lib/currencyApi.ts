import { Currency, POPULAR_CURRENCIES } from "@/types/csv";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", CNY: "¥", KRW: "₩",
  INR: "₹", RUB: "₽", TRY: "₺", NGN: "₦", ARS: "$", BRL: "R$",
  CAD: "C$", AUD: "A$", NZD: "NZ$", SGD: "S$", HKD: "HK$", MXN: "Mex$",
  PHP: "₱", THB: "฿", ZAR: "R", PLN: "zł", SEK: "kr", NOK: "kr",
  DKK: "kr", CZK: "Kč", HUF: "Ft", ILS: "₪", CHF: "Fr", AED: "د.إ",
  SAR: "﷼", QAR: "﷼", KWD: "د.ك", BHD: "د.ب", OMR: "ر.ع.",
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  KRW: "South Korean Won",
  INR: "Indian Rupee",
  RUB: "Russian Ruble",
  TRY: "Turkish Lira",
  BRL: "Brazilian Real",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  NZD: "New Zealand Dollar",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  MXN: "Mexican Peso",
};

const CACHE_DURATION = 60 * 60 * 1000;
let cachedRates: { timestamp: number; rates: Record<string, number> } | null = null;

export async function fetchExchangeRates(): Promise<Record<string, number>> {
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    return cachedRates.rates;
  }

  try {
    const response = await fetch(
      'https://open.er-api.com/v6/latest/USD'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    cachedRates = {
      timestamp: Date.now(),
      rates: data.rates
    };

    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return { USD: 1 };
  }
}

export async function fetchCurrencies(): Promise<Currency[]> {
  try {
    const rates = await fetchExchangeRates();
    const currencies: Currency[] = [];

    Object.entries(rates).forEach(([code, rate]) => {
      currencies.push({
        code,
        name: CURRENCY_NAMES[code] || code,
        symbol: CURRENCY_SYMBOLS[code] || code,
        rate
      });
    });

    // Sort currencies: popular ones first, then alphabetically by code
    return currencies.sort((a, b) => {
      const aPopular = POPULAR_CURRENCIES.includes(a.code);
      const bPopular = POPULAR_CURRENCIES.includes(b.code);
      
      if (aPopular && bPopular) {
        if (a.code === "USD") return -1;
        if (b.code === "USD") return 1;
        return POPULAR_CURRENCIES.indexOf(a.code) - POPULAR_CURRENCIES.indexOf(b.code);
      }
      
      if (aPopular) return -1;
      if (bPopular) return 1;
      
      return a.code.localeCompare(b.code);
    });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return [{ code: "USD", name: "US Dollar", symbol: "$", rate: 1 }];
  }
} 