// Market data fetching utilities
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  prediction?: number;
}

// Fetch real crypto data from CoinGecko API (free tier)
export const fetchCryptoData = async (limit = 10): Promise<CoinData[]> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return getMockData();
  }
};

// Fetch historical price data for charts
export const fetchPriceHistory = async (coinId: string): Promise<PriceHistoryPoint[]> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=hourly`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price history');
    }
    
    const data = await response.json();
    
    return data.prices.map((point: [number, number], index: number) => ({
      timestamp: new Date(point[0]).toLocaleDateString(),
      price: point[1],
      prediction: index > data.prices.length - 10 ? point[1] * (1 + (Math.random() - 0.5) * 0.1) : undefined
    }));
  } catch (error) {
    console.error('Error fetching price history:', error);
    return getMockPriceHistory();
  }
};

// Simple prediction algorithm using moving averages
export const generatePrediction = (prices: number[]): { 
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
} => {
  if (prices.length < 2) return { direction: 'neutral', confidence: 50 };
  
  const recent = prices.slice(-5);
  const older = prices.slice(-10, -5);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  const confidence = Math.min(90, Math.abs(change * 10) + 60);
  
  if (change > 2) return { direction: 'bullish', confidence: Math.round(confidence) };
  if (change < -2) return { direction: 'bearish', confidence: Math.round(confidence) };
  return { direction: 'neutral', confidence: Math.round(confidence) };
};

// Mock data fallback
const getMockData = (): CoinData[] => [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    current_price: 43250.50,
    price_change_percentage_24h: 2.34,
    total_volume: 15234567890,
    market_cap: 847563291047,
  },
  {
    id: 'ethereum',
    symbol: 'ETH', 
    name: 'Ethereum',
    current_price: 2456.78,
    price_change_percentage_24h: -1.23,
    total_volume: 8745632145,
    market_cap: 295847362018,
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    current_price: 0.456,
    price_change_percentage_24h: 5.67,
    total_volume: 1234567890,
    market_cap: 15847362018,
  }
];

const getMockPriceHistory = (): PriceHistoryPoint[] => {
  const basePrice = 43000;
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toLocaleDateString(),
    price: basePrice + Math.random() * 2000 - 1000,
    prediction: i > 20 ? basePrice + Math.random() * 3000 - 1500 : undefined,
  }));
};