export async function detectUserCurrency(): Promise<string | null> {
  try {
    // Construct request to ipapi.co to get currency code
    const response = await fetch('https://ipapi.co/currency/');
    
    if (response.ok) {
      const currency = await response.text();
      return currency.trim() || null;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to detect user currency:', error);
    return null;
  }
}
