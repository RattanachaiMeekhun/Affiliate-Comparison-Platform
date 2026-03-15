'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchCurrencies, CurrencyRate } from '@/lib/api';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  rates: CurrencyRate[];
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCurrency, setSelectedCurrencyState] = useState('THB');
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted currency from localStorage
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      setSelectedCurrencyState(saved);
    }

    async function loadRates() {
      try {
        const data = await fetchCurrencies();
        setRates(data);
      } catch (err) {
        console.error("Error loading exchange rates", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRates();
  }, []);

  const setSelectedCurrency = (currency: string) => {
    setSelectedCurrencyState(currency);
    localStorage.setItem('selectedCurrency', currency);
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, rates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
