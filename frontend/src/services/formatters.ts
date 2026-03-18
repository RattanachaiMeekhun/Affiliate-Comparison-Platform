import { CurrencyRate } from './api';

export const formatPrice = (
  amount: number | string | null,
  sourceCurrency: string,
  targetCurrency: string,
  rates: CurrencyRate[]
): string => {
  if (amount === null || amount === undefined) return 'N/A';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return 'N/A';

  // Base currency is THB (where THB rate = 1.0)
  // To convert X source to Y target: (Amount / SourceRate) * TargetRate
  
  const sourceRateObj = rates.find(r => r.code === sourceCurrency);
  const targetRateObj = rates.find(r => r.code === targetCurrency);

  const sourceRate = sourceRateObj?.rate || 1.0;
  const targetRate = targetRateObj?.rate || 1.0;

  // Since our rates are relative to THB (1 THB = X USD), 
  // Rate for USD is 0.028 approx. 
  // To convert USD to THB: USD_Amount / 0.028 = THB_Amount
  // To convert THB to USD: THB_Amount * 0.028 = USD_Amount
  
  // Actually, let's look at how I seeded:
  // USD rate = 0.028 (1 THB = 0.028 USD)
  // So:
  // Amount in THB = Amount in Source / SourceRate
  // Amount in Target = Amount in THB * TargetRate
  
  const amountInBase = numericAmount / sourceRate;
  const convertedAmount = amountInBase * targetRate;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: targetCurrency,
  });

  return formatter.format(convertedAmount);
};
