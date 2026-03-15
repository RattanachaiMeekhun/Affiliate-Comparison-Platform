'use client';

import React from 'react';
import { Select } from 'antd';
import { useCurrency } from '@/context/CurrencyContext';
import { GlobalOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency, rates, isLoading } = useCurrency();

  if (isLoading) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <GlobalOutlined style={{ color: 'var(--text-muted)', fontSize: 16 }} />
      <Select
        value={selectedCurrency}
        onChange={setSelectedCurrency}
        variant="borderless"
        style={{ width: 80, fontWeight: 600 }}
        popupStyle={{ minWidth: 100 }}
      >
        {rates.map((rate) => (
          <Option key={rate.code} value={rate.code}>
            {rate.code}
          </Option>
        ))}
      </Select>
    </div>
  );
}
