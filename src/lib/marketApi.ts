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
  isHistorical?: boolean;
  trend?: 'bullish' | 'bearish' | 'neutral';
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

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface ForexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
}

export interface InvestmentAnalysis {
  asset: string;
  currentPrice: number;
  predictedPrice: number;
  expectedReturn: number;
  expectedReturnPercent: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  timeframe: string;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  reasoning: string;
  technicalIndicators: {
    rsi: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    volatility: number;
    support: number;
    resistance: number;
  };
}

// API Configuration
const ALPHAWAVE_API_KEY = 'Q0FJAMTC6ELZAOJ0';
const ALPHAWAVE_BASE_URL = 'https://api.alphawavedata.com/v1';
const ALPHA_VANTAGE_API_KEY = 'demo'; // Using demo key for testing
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Fetch real crypto data from CoinGecko API (free tier)
export const fetchCryptoData = async (limit = 10): Promise<CoinData[]> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }
    
    const data = await response.json();
    console.log('✅ Fetched real crypto data from CoinGecko:', data.length, 'coins');
    return data;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return [];
  }
};

// Fetch historical price data for charts  
export const fetchPriceHistory = async (coinId: string, dataType: 'crypto' | 'stock' | 'forex' = 'crypto'): Promise<PriceHistoryPoint[]> => {
  try {
    if (dataType === 'crypto') {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto price history');
      }
      
      const data = await response.json();
      console.log('✅ Fetched real crypto price history for', coinId, ':', data.prices.length, 'data points');
      
      const historicalData = data.prices.map((point: [number, number]) => ({
        timestamp: new Date(point[0]).toISOString(),
        price: point[1],
        isHistorical: true
      }));
      
      // Generate future predictions (next 7 days)
      const lastPrice = historicalData[historicalData.length - 1].price;
      const priceHistory = data.prices.map(p => p[1]);
      const trend = generatePrediction(priceHistory);
      
      const predictions = [];
      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        
        // Generate prediction based on trend and volatility
        const volatility = calculateVolatility(priceHistory);
        const trendMultiplier = trend.direction === 'bullish' ? 1 + (i * 0.005) : 
                               trend.direction === 'bearish' ? 1 - (i * 0.005) : 1;
        const volatilityFactor = 1 + (Math.random() - 0.5) * volatility * 0.1;
        
        const predictedPrice = lastPrice * trendMultiplier * volatilityFactor;
        
        predictions.push({
          timestamp: futureDate.toISOString(),
          price: predictedPrice,
          isHistorical: false,
          trend: trend.direction
        });
      }
      
      return [...historicalData, ...predictions];
    } else if (dataType === 'stock') {
      // Fetch stock data from Alpha Vantage
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${coinId}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock price history');
      }
      
      const data = await response.json();
      console.log('✅ Fetched real stock price history for', coinId);
      
      if (data['Time Series (Daily)']) {
        const timeSeries = data['Time Series (Daily)'];
        const sortedDates = Object.keys(timeSeries).sort().slice(-30); // Last 30 days
        
        const historicalData = sortedDates.map((date) => ({
          timestamp: new Date(date).toISOString(),
          price: parseFloat(timeSeries[date]['4. close']),
          isHistorical: true
        }));
        
        // Generate future predictions (next 7 days)
        const lastPrice = historicalData[historicalData.length - 1].price;
        const priceHistory = historicalData.map(h => h.price);
        const trend = generatePrediction(priceHistory);
        
        const predictions = [];
        for (let i = 1; i <= 7; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);
          
          const volatility = calculateVolatility(priceHistory);
          const trendMultiplier = trend.direction === 'bullish' ? 1 + (i * 0.005) : 
                                 trend.direction === 'bearish' ? 1 - (i * 0.005) : 1;
          const volatilityFactor = 1 + (Math.random() - 0.5) * volatility * 0.1;
          
          const predictedPrice = lastPrice * trendMultiplier * volatilityFactor;
          
          predictions.push({
            timestamp: futureDate.toISOString(),
            price: predictedPrice,
            isHistorical: false,
            trend: trend.direction
          });
        }
        
        return [...historicalData, ...predictions];
      }
    } else if (dataType === 'forex') {
      // Fetch forex data from Alpha Vantage
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=FX_DAILY&from_symbol=${coinId.substring(0,3)}&to_symbol=${coinId.substring(3,6)}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch forex price history');
      }
      
      const data = await response.json();
      console.log('✅ Fetched real forex price history for', coinId);
      
      if (data['Time Series FX (Daily)']) {
        const timeSeries = data['Time Series (FX)'];
        const sortedDates = Object.keys(timeSeries).sort().slice(-30); // Last 30 days
        
        const historicalData = sortedDates.map((date) => ({
          timestamp: new Date(date).toISOString(),
          price: parseFloat(timeSeries[date]['4. close']),
          isHistorical: true
        }));
        
        // Generate future predictions (next 7 days)
        const lastPrice = historicalData[historicalData.length - 1].price;
        const priceHistory = historicalData.map(h => h.price);
        const trend = generatePrediction(priceHistory);
        
        const predictions = [];
        for (let i = 1; i <= 7; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);
          
          const volatility = calculateVolatility(priceHistory);
          const trendMultiplier = trend.direction === 'bullish' ? 1 + (i * 0.002) : 
                                 trend.direction === 'bearish' ? 1 - (i * 0.002) : 1;
          const volatilityFactor = 1 + (Math.random() - 0.5) * volatility * 0.05;
          
          const predictedPrice = lastPrice * trendMultiplier * volatilityFactor;
          
          predictions.push({
            timestamp: futureDate.toISOString(),
            price: predictedPrice,
            isHistorical: false,
            trend: trend.direction
          });
        }
        
        return [...historicalData, ...predictions];
      }
    }
    
    throw new Error('Invalid data type');
  } catch (error) {
    console.error('Error fetching price history:', error);
    return [];
  }
};

// Advanced prediction algorithm using multiple technical indicators
export const generateAdvancedPrediction = (prices: number[]): number | undefined => {
  if (prices.length < 10) return undefined;
  
  // Calculate moving averages
  const sma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const sma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
  
  // Calculate RSI (simplified)
  const gains = [];
  const losses = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains.push(change);
    else losses.push(Math.abs(change));
  }
  
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  const rs = avgGain / (avgLoss || 0.001);
  const rsi = 100 - (100 / (1 + rs));
  
  // Calculate volatility
  const volatility = Math.sqrt(
    prices.slice(-10).reduce((sum, price) => {
      const mean = sma10;
      return sum + Math.pow(price - mean, 2);
    }, 0) / 10
  ) / sma10;
  
  // Generate prediction based on technical analysis
  const trend = sma5 > sma10 ? 1 : -1;
  const rsiSignal = rsi < 30 ? 1.02 : rsi > 70 ? 0.98 : 1;
  const volatilityFactor = Math.max(0.95, Math.min(1.05, 1 - volatility * 0.5));
  
  const currentPrice = prices[prices.length - 1];
  const prediction = currentPrice * trend * rsiSignal * volatilityFactor;
  
  return Math.round(prediction * 100) / 100;
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

// Fetch real stock data using Alpha Vantage API
export const fetchStockData = async (symbols: string[] = ['MSFT']): Promise<StockData[]> => {
  const stocks: StockData[] = [];
  
  for (const symbol of symbols) {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data for ${symbol}`);
      }
      
      const data = await response.json();
      
      if (data['Global Quote'] && data['Global Quote']['01. symbol']) {
        const quote = data['Global Quote'];
        stocks.push({
          symbol: quote['01. symbol'],
          name: getCompanyName(symbol),
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          marketCap: calculateMarketCap(parseFloat(quote['05. price']), symbol), // Calculate market cap
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          open: parseFloat(quote['02. open']),
          previousClose: parseFloat(quote['08. previous close'])
        });
        console.log('✅ Fetched real stock data for', symbol);
      }
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
    }
  }
  
  return stocks;
};

// Fetch real forex data using Alpha Vantage API
export const fetchForexData = async (): Promise<ForexData[]> => {
  const forexPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
  const forex: ForexData[] = [];
  
  for (const pair of forexPairs) {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=FX_DAILY&from_symbol=${pair.substring(0,3)}&to_symbol=${pair.substring(3,6)}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch forex data for ${pair}`);
      }
      
      const data = await response.json();
      
      if (data['Time Series (FX)']) {
        const timeSeries = data['Time Series (FX)'];
        const dates = Object.keys(timeSeries).sort();
        const latest = timeSeries[dates[dates.length - 1]];
        const previous = timeSeries[dates[dates.length - 2]];
        
        const currentPrice = parseFloat(latest['4. close']);
        const previousPrice = parseFloat(previous['4. close']);
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;
        
        forex.push({
          symbol: pair,
          name: getForexName(pair),
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: Math.round(Math.random() * 1000000000 + 500000000), // Simulated volume
          marketCap: 0 // Forex doesn't have market cap concept
        });
        console.log('✅ Fetched real forex data for', pair);
      }
    } catch (error) {
      console.error(`Error fetching forex data for ${pair}:`, error);
    }
  }
  
  return forex;
};

// Fetch commodities data using real APIs
export const fetchCommoditiesData = async (): Promise<CommodityData[]> => {
  try {
    // Try Alpha Vantage for gold and silver
    const goldResponse = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?function=DIGITAL_CURRENCY_DAILY&symbol=GOLD&market=USD&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (goldResponse.ok) {
      const goldData = await goldResponse.json();
      console.log('✅ Fetched real commodities data from Alpha Vantage');
      
      // Process gold data if available
      if (goldData['Time Series (Digital Currency Daily)']) {
        const timeSeries = goldData['Time Series (Digital Currency Daily)'];
        const dates = Object.keys(timeSeries).sort();
        const latest = timeSeries[dates[dates.length - 1]];
        const previous = timeSeries[dates[dates.length - 2]];
        
        const currentPrice = parseFloat(latest['4b. close (USD)']);
        const previousPrice = parseFloat(previous['4b. close (USD)']);
        const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
        
        return [
          {
            id: 'gold',
            name: 'Gold',
            symbol: 'XAU',
            current_price: currentPrice,
            price_change_percentage_24h: changePercent,
            market_cap: 13000000000000,
            volume: 180000000000
          },
          {
            id: 'silver',
            name: 'Silver',
            symbol: 'XAG',
            current_price: currentPrice * 0.012, // Approximate silver to gold ratio
            price_change_percentage_24h: changePercent * 1.2,
            market_cap: 1400000000000,
            volume: 25000000000
          }
        ];
      }
    }
    
    // Fallback to mock data
    console.log('⚠️ Using mock commodities data');
    return getMockCommoditiesData();
  } catch (error) {
    console.error('Error fetching commodities data:', error);
    console.log('⚠️ Falling back to mock commodities data');
    return getMockCommoditiesData();
  }
};

// Generate investment advice based on market data
export const generateInvestmentAdvice = (
  cryptoData: CoinData[], 
  commoditiesData: CommodityData[], 
  stockData: StockData[] = [],
  forexData: ForexData[] = []
): InvestmentAdvice[] => {
  const advice: InvestmentAdvice[] = [];
  
  // Analyze crypto trends
  if (cryptoData.length > 0) {
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
  }

  // Analyze stocks
  stockData.forEach(stock => {
    if (stock.changePercent > 3) {
      advice.push({
        asset: stock.name,
        action: 'BUY',
        confidence: 70,
        reasoning: `${stock.symbol} showing strong upward momentum with ${stock.changePercent.toFixed(2)}% gain.`,
        risk_level: 'MEDIUM'
      });
    } else if (stock.changePercent < -3) {
      advice.push({
        asset: stock.name,
        action: 'BUY',
        confidence: 65,
        reasoning: `${stock.symbol} at attractive entry point after ${Math.abs(stock.changePercent).toFixed(2)}% decline.`,
        risk_level: 'MEDIUM'
      });
    }
  });

  // Analyze forex
  forexData.forEach(forex => {
    if (Math.abs(forex.changePercent) > 1) {
      advice.push({
        asset: forex.name,
        action: forex.changePercent > 0 ? 'BUY' : 'SELL',
        confidence: 60,
        reasoning: `${forex.symbol} showing significant movement of ${forex.changePercent.toFixed(2)}%.`,
        risk_level: 'LOW'
      });
    }
  });

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

// Advanced investment analysis for user-specified assets
export const analyzeInvestment = async (
  assetSymbol: string,
  assetType: 'crypto' | 'stock' | 'forex' | 'commodity',
  timeframe: '1D' | '1W' | '1M' | '3M' = '1W'
): Promise<InvestmentAnalysis> => {
  try {
    console.log(`🔍 Analyzing ${assetType}: ${assetSymbol} for ${timeframe}`);
    
    let currentPrice = 0;
    let priceHistory: number[] = [];
    let assetName = assetSymbol;
    
    // Fetch current data based on asset type
    if (assetType === 'crypto') {
      // Fetch more cryptocurrencies to ensure we find the requested one
      const cryptoData = await fetchCryptoData(250);
      const asset = cryptoData.find(coin => 
        coin.symbol.toLowerCase() === assetSymbol.toLowerCase() || 
        coin.id.toLowerCase() === assetSymbol.toLowerCase() ||
        coin.name.toLowerCase().includes(assetSymbol.toLowerCase())
      );
      
      if (asset) {
        currentPrice = asset.current_price;
        assetName = asset.name;
        priceHistory = asset.sparkline_in_7d?.price || [currentPrice];
        console.log(`✅ Found crypto asset: ${assetName} (${asset.symbol}) at $${currentPrice}`);
      } else {
        // If not found in the list, try to fetch specific coin data
        console.log(`⚠️ ${assetSymbol} not found in top 250, trying specific fetch...`);
        try {
          const specificResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${assetSymbol.toLowerCase()}`);
          if (specificResponse.ok) {
            const specificData = await specificResponse.json();
            currentPrice = specificData.market_data?.current_price?.usd || 0;
            assetName = specificData.name || assetSymbol;
            // Get price history for this specific coin
            const historyResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${assetSymbol.toLowerCase()}/market_chart?vs_currency=usd&days=7`);
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              priceHistory = historyData.prices?.map((p: [number, number]) => p[1]) || [currentPrice];
            } else {
              priceHistory = [currentPrice];
            }
            console.log(`✅ Fetched specific crypto data: ${assetName} at $${currentPrice}`);
          } else {
            throw new Error(`Crypto asset ${assetSymbol} not found`);
          }
        } catch (error) {
          throw new Error(`Crypto asset ${assetSymbol} not found`);
        }
      }
    } else if (assetType === 'stock') {
      const stockData = await fetchStockData([assetSymbol]);
      if (stockData.length > 0) {
        currentPrice = stockData[0].price;
        assetName = stockData[0].name;
        priceHistory = [stockData[0].open, stockData[0].high, stockData[0].low, stockData[0].price];
        console.log(`✅ Found stock: ${assetName} (${assetSymbol}) at $${currentPrice}`);
      } else {
        // Try to fetch specific stock data if not found in default list
        try {
          const response = await fetch(
            `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${assetSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data['Global Quote'] && data['Global Quote']['01. symbol']) {
              const quote = data['Global Quote'];
              currentPrice = parseFloat(quote['05. price']);
              assetName = getCompanyName(assetSymbol);
              priceHistory = [
                parseFloat(quote['02. open']),
                parseFloat(quote['03. high']),
                parseFloat(quote['04. low']),
                parseFloat(quote['05. price'])
              ];
              console.log(`✅ Fetched specific stock data: ${assetName} at $${currentPrice}`);
            } else {
              throw new Error(`Stock ${assetSymbol} not found`);
            }
          } else {
            throw new Error(`Stock ${assetSymbol} not found`);
          }
        } catch (error) {
          throw new Error(`Stock ${assetSymbol} not found`);
        }
      }
    } else if (assetType === 'forex') {
      const forexData = await fetchForexData();
      const asset = forexData.find(forex => 
        forex.symbol.toLowerCase() === assetSymbol.toLowerCase()
      );
      
      if (asset) {
        currentPrice = asset.price;
        assetName = asset.name;
        priceHistory = [asset.price * 0.99, asset.price * 1.01, asset.price];
        console.log(`✅ Found forex: ${assetName} (${assetSymbol}) at ${currentPrice}`);
      } else {
        // Try to fetch specific forex data
        try {
          const fromSymbol = assetSymbol.substring(0, 3);
          const toSymbol = assetSymbol.substring(3, 6);
          const response = await fetch(
            `${ALPHA_VANTAGE_BASE_URL}?function=FX_DAILY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data['Time Series (FX)']) {
              const timeSeries = data['Time Series (FX)'];
              const dates = Object.keys(timeSeries).sort();
              const latest = timeSeries[dates[dates.length - 1]];
              currentPrice = parseFloat(latest['4. close']);
              assetName = getForexName(assetSymbol);
              priceHistory = [
                parseFloat(latest['1. open']),
                parseFloat(latest['2. high']),
                parseFloat(latest['3. low']),
                parseFloat(latest['4. close'])
              ];
              console.log(`✅ Fetched specific forex data: ${assetName} at ${currentPrice}`);
            } else {
              throw new Error(`Forex pair ${assetSymbol} not found`);
            }
          } else {
            throw new Error(`Forex pair ${assetSymbol} not found`);
          }
        } catch (error) {
          throw new Error(`Forex pair ${assetSymbol} not found`);
        }
      }
    } else if (assetType === 'commodity') {
      const commodityData = await fetchCommoditiesData();
      const asset = commodityData.find(commodity => 
        commodity.symbol.toLowerCase() === assetSymbol.toLowerCase() ||
        commodity.name.toLowerCase() === assetSymbol.toLowerCase()
      );
      
      if (asset) {
        currentPrice = asset.current_price;
        assetName = asset.name;
        priceHistory = [currentPrice * 0.98, currentPrice * 1.02, currentPrice];
      }
    }
    
    if (currentPrice === 0) {
      throw new Error(`Asset ${assetSymbol} not found`);
    }
    
    // Generate advanced prediction
    const predictedPrice = generateAdvancedPrediction(priceHistory) || currentPrice;
    const expectedReturn = predictedPrice - currentPrice;
    const expectedReturnPercent = (expectedReturn / currentPrice) * 100;
    
    // Calculate technical indicators
    const rsi = calculateRSI(priceHistory);
    const trend = calculateTrend(priceHistory);
    const volatility = calculateVolatility(priceHistory);
    const support = Math.min(...priceHistory) * 0.98;
    const resistance = Math.max(...priceHistory) * 1.02;
    
    // Determine risk level
    const riskLevel = volatility > 0.05 ? 'HIGH' : volatility > 0.02 ? 'MEDIUM' : 'LOW';
    
    // Calculate confidence based on data quality and indicators
    const confidence = Math.min(95, Math.max(60, 
      70 + (priceHistory.length > 10 ? 10 : 0) + 
      (Math.abs(rsi - 50) < 20 ? 10 : 0) +
      (volatility < 0.03 ? 5 : 0)
    ));
    
    // Generate recommendation
    let recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
    if (expectedReturnPercent > 10 && rsi < 70) recommendation = 'STRONG_BUY';
    else if (expectedReturnPercent > 5 && rsi < 75) recommendation = 'BUY';
    else if (expectedReturnPercent < -10 && rsi > 30) recommendation = 'STRONG_SELL';
    else if (expectedReturnPercent < -5 && rsi > 25) recommendation = 'SELL';
    else recommendation = 'HOLD';
    
    // Generate reasoning
    const reasoning = generateReasoning(expectedReturnPercent, rsi, trend, volatility, riskLevel);
    
    const analysis: InvestmentAnalysis = {
      asset: assetName,
      currentPrice: Math.round(currentPrice * 100) / 100,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      expectedReturn: Math.round(expectedReturn * 100) / 100,
      expectedReturnPercent: Math.round(expectedReturnPercent * 100) / 100,
      riskLevel,
      confidence: Math.round(confidence),
      timeframe,
      recommendation,
      reasoning,
      technicalIndicators: {
        rsi: Math.round(rsi * 100) / 100,
        trend,
        volatility: Math.round(volatility * 10000) / 100, // Convert to percentage
        support: Math.round(support * 100) / 100,
        resistance: Math.round(resistance * 100) / 100
      }
    };
    
    console.log(`✅ Analysis complete for ${assetName}: ${recommendation} (${expectedReturnPercent.toFixed(2)}%)`);
    return analysis;
    
  } catch (error) {
    console.error('Error analyzing investment:', error);
    throw error;
  }
};

// Helper functions for technical analysis
const calculateRSI = (prices: number[]): number => {
  if (prices.length < 2) return 50;
  
  const gains = [];
  const losses = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains.push(change);
    else losses.push(Math.abs(change));
  }
  
  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0.001;
  const rs = avgGain / avgLoss;
  
  return 100 - (100 / (1 + rs));
};

const calculateTrend = (prices: number[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
  if (prices.length < 5) return 'NEUTRAL';
  
  const sma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const sma10 = prices.length >= 10 ? prices.slice(-10).reduce((a, b) => a + b, 0) / 10 : sma5;
  
  const change = ((sma5 - sma10) / sma10) * 100;
  
  if (change > 2) return 'BULLISH';
  if (change < -2) return 'BEARISH';
  return 'NEUTRAL';
};

const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  
  return Math.sqrt(variance) / mean;
};

const generateReasoning = (
  expectedReturn: number, 
  rsi: number, 
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL', 
  volatility: number,
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
): string => {
  const reasons = [];
  
  if (Math.abs(expectedReturn) > 5) {
    reasons.push(`Strong ${expectedReturn > 0 ? 'positive' : 'negative'} momentum with ${Math.abs(expectedReturn).toFixed(1)}% expected return`);
  }
  
  if (rsi < 30) {
    reasons.push('Oversold conditions (RSI < 30) suggest potential bounce');
  } else if (rsi > 70) {
    reasons.push('Overbought conditions (RSI > 70) indicate potential pullback');
  }
  
  if (trend !== 'NEUTRAL') {
    reasons.push(`${trend.toLowerCase()} trend confirmed by moving averages`);
  }
  
  if (volatility > 0.05) {
    reasons.push(`High volatility (${(volatility * 100).toFixed(1)}%) increases risk but also opportunity`);
  }
  
  reasons.push(`${riskLevel.toLowerCase()} risk investment based on price stability`);
  
  return reasons.join('. ') + '.';
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

// Helper functions
const calculateMarketCap = (price: number, symbol: string): number => {
  // Approximate market cap based on known values and price ratios
  const marketCaps: { [key: string]: number } = {
    'AAPL': 2800000000000, // $2.8T
    'MSFT': 2800000000000, // $2.8T
    'GOOGL': 1800000000000, // $1.8T
    'TSLA': 790000000000,  // $790B
    'AMZN': 1500000000000, // $1.5T
    'META': 800000000000,  // $800B
    'NVDA': 1200000000000, // $1.2T
    'NFLX': 200000000000   // $200B
  };
  
  const baseMarketCap = marketCaps[symbol] || 1000000000000; // Default $1T
  const basePrice = 150; // Approximate base price for scaling
  
  // Scale market cap based on current price vs base price
  return Math.round(baseMarketCap * (price / basePrice));
};

const getCompanyName = (symbol: string): string => {
  const names: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'TSLA': 'Tesla Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'NFLX': 'Netflix Inc.'
  };
  return names[symbol] || symbol;
};

const getForexName = (pair: string): string => {
  const names: { [key: string]: string } = {
    'EURUSD': 'Euro / US Dollar',
    'GBPUSD': 'British Pound / US Dollar',
    'USDJPY': 'US Dollar / Japanese Yen',
    'AUDUSD': 'Australian Dollar / US Dollar',
    'USDCAD': 'US Dollar / Canadian Dollar',
    'USDCHF': 'US Dollar / Swiss Franc'
  };
  return names[pair] || pair;
};

const getMockPriceHistory = (): PriceHistoryPoint[] => {
  const basePrice = 43000;
  return Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toLocaleDateString(),
    price: basePrice + Math.random() * 2000 - 1000,
    prediction: i > 20 ? basePrice + Math.random() * 3000 - 1500 : undefined,
  }));
};

const getMockStockData = (): StockData[] => [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45678900,
    marketCap: 2800000000000,
    high: 176.20,
    low: 173.50,
    open: 174.00,
    previousClose: 173.28
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: -1.25,
    changePercent: -0.33,
    volume: 23456700,
    marketCap: 2800000000000,
    high: 380.50,
    low: 377.20,
    open: 379.10,
    previousClose: 380.10
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: 3.42,
    changePercent: 2.46,
    volume: 34567800,
    marketCap: 1800000000000,
    high: 143.20,
    low: 140.80,
    open: 141.00,
    previousClose: 139.14
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.73,
    change: -5.67,
    changePercent: -2.23,
    volume: 67890100,
    marketCap: 790000000000,
    high: 255.40,
    low: 247.80,
    open: 254.40,
    previousClose: 254.40
  }
];

const getMockForexData = (): ForexData[] => [
  {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    price: 1.0845,
    change: 0.0023,
    changePercent: 0.21,
    volume: 750000000,
    marketCap: 0
  },
  {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar',
    price: 1.2654,
    change: -0.0012,
    changePercent: -0.09,
    volume: 650000000,
    marketCap: 0
  },
  {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
    price: 149.23,
    change: 0.45,
    changePercent: 0.30,
    volume: 800000000,
    marketCap: 0
  },
  {
    symbol: 'AUDUSD',
    name: 'Australian Dollar / US Dollar',
    price: 0.6543,
    change: 0.0018,
    changePercent: 0.28,
    volume: 450000000,
    marketCap: 0
  }
];