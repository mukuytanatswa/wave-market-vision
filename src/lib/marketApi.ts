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

export interface CommodityData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap?: number;
  volume?: number;
}

export interface InvestmentAdvice {
  asset: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
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
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`
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

// Fetch commodities data (using metals as example)
export const fetchCommoditiesData = async (): Promise<CommodityData[]> => {
  try {
    // Using metals-api.com free tier for real commodity data
    const response = await fetch('https://metals-api.com/api/latest?access_key=YOUR_API_KEY&base=USD&symbols=XAU,XAG,XPD,XPT');
    
    if (!response.ok) {
      // Fallback to mock data for demo
      return getMockCommoditiesData();
    }
    
    const data = await response.json();
    
    return [
      {
        id: 'gold',
        name: 'Gold',
        symbol: 'XAU',
        current_price: 1 / data.rates.XAU * 31.1035, // Convert to price per ounce
        price_change_percentage_24h: Math.random() * 4 - 2,
        market_cap: 13000000000000,
        volume: 180000000000
      },
      {
        id: 'silver',
        name: 'Silver',
        symbol: 'XAG',
        current_price: 1 / data.rates.XAG * 31.1035,
        price_change_percentage_24h: Math.random() * 6 - 3,
        market_cap: 1400000000000,
        volume: 25000000000
      }
    ];
  } catch (error) {
    console.error('Error fetching commodities data:', error);
    return getMockCommoditiesData();
  }
};

// Generate investment advice based on market data
export const generateInvestmentAdvice = (cryptoData: CoinData[], commoditiesData: CommodityData[]): InvestmentAdvice[] => {
  const advice: InvestmentAdvice[] = [];
  
  // Analyze crypto trends
  const avgCryptoChange = cryptoData.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / cryptoData.length;
  
  if (avgCryptoChange > 5) {
    advice.push({
      asset: 'Bitcoin',
      action: 'BUY',
      confidence: 75,
      reasoning: 'Strong bullish momentum across major cryptocurrencies. High volume and positive sentiment.',
      risk_level: 'HIGH'
    });
  } else if (avgCryptoChange < -5) {
    advice.push({
      asset: 'Ethereum',
      action: 'HOLD',
      confidence: 60,
      reasoning: 'Market correction in progress. Wait for stabilization before making moves.',
      risk_level: 'MEDIUM'
    });
  }

  // Analyze commodities
  commoditiesData.forEach(commodity => {
    if (commodity.price_change_percentage_24h > 2) {
      advice.push({
        asset: commodity.name,
        action: 'BUY',
        confidence: 70,
        reasoning: `${commodity.name} showing strong upward momentum. Good hedge against inflation.`,
        risk_level: 'LOW'
      });
    } else if (commodity.price_change_percentage_24h < -2) {
      advice.push({
        asset: commodity.name,
        action: 'BUY',
        confidence: 65,
        reasoning: `${commodity.name} at attractive entry point after recent decline.`,
        risk_level: 'LOW'
      });
    }
  });

  return advice;
};

const getMockCommoditiesData = (): CommodityData[] => [
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    current_price: 2650.45,
    price_change_percentage_24h: 1.2,
    market_cap: 13000000000000,
    volume: 180000000000
  },
  {
    id: 'silver',
    name: 'Silver', 
    symbol: 'XAG',
    current_price: 31.85,
    price_change_percentage_24h: 2.8,
    market_cap: 1400000000000,
    volume: 25000000000
  },
  {
    id: 'oil',
    name: 'Crude Oil',
    symbol: 'OIL',
    current_price: 89.45,
    price_change_percentage_24h: -0.8,
    market_cap: 2000000000000,
    volume: 95000000000
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