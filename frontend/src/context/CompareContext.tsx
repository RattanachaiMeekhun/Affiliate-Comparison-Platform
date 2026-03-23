'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

// Basic details needed for the sticky bar and comparison page
export interface CompareProduct {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
}

interface CompareContextType {
  compareItems: CompareProduct[];
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (isOpen: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('compareItems');
    if (saved) {
      try {
        setCompareItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse compareItems from local storage', e);
      }
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product: CompareProduct) => {
    if (compareItems.length >= 4) {
      message.warning('You can only compare up to 4 items at a time.');
      return;
    }
    
    // Prevent duplicates
    if (compareItems.find((item) => item.id === product.id)) {
      message.info(`${product.name} is already in the comparison list.`);
      return;
    }

    setCompareItems((prev) => [...prev, product]);
    message.success(`${product.name} added to comparison.`);
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isCompareModalOpen, setIsCompareModalOpen }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
