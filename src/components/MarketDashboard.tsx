import { useState, useEffect } from 'react';
import { MarketOverview } from './MarketOverview';
import { MarketCard } from './MarketCard';
import { PriceChart } from './PriceChart';
import { InvestmentAdvice } from './InvestmentAdvice';
import { CommoditiesSection } from './CommoditiesSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, BarChart3, TrendingUp } from 'lucide-react';
import { 
  fetchCryptoData, 
  fetchPriceHistory, 
  fetchCommoditiesData,
  fetchStockData,
  fetchForexData,
  generatePrediction, 
  generateInvestmentAdvice,
  CoinData, 
  PriceHistoryPoint,
  CommodityData,
  StockData,
  ForexData,
  InvestmentAdvice as IInvestmentAdvice
} from '@/lib/marketApi';
import { InvestmentAnalyzer } from './InvestmentAnalyzer';

export const MarketDashboard = () => {
  const [cryptoData, setCryptoData] = useState<CoinData[]>([]);
  const [commoditiesData, setCommoditiesData] = useState<CommodityData[]>([]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [forexData, setForexData] = useState<ForexData[]>([]);
  const [investmentAdvice, setInvestmentAdvice] = useState<IInvestmentAdvice[]>([]);
  const [chartData, setChartData] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCoin, setSelectedCoin] = useState<string>('bitcoin');
  const [dataSource, setDataSource] = useState<'crypto' | 'stock' | 'forex'>('crypto');
  const [selectedAsset, setSelectedAsset] = useState<string>('bitcoin');

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading real market data...');
      
      const [coins, priceHistory, commodities, stocks, forex] = await Promise.all([
        fetchCryptoData(8),
        fetchPriceHistory(selectedAsset, dataSource),
        fetchCommoditiesData(),
        fetchStockData(),
        fetchForexData()
      ]);
      
      setCryptoData(coins);
      setChartData(priceHistory);
      setCommoditiesData(commodities);
      setStockData(stocks);
      setForexData(forex);
      
      // Generate investment advice based on all real market data
      const advice = generateInvestmentAdvice(coins, commodities, stocks, forex);
      setInvestmentAdvice(advice);
      
      setLastUpdate(new Date());
      console.log('✅ All market data loaded successfully');
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedAsset, dataSource]);

  // Update selectedAsset when dataSource changes
  useEffect(() => {
    switch (dataSource) {
      case 'crypto':
        setSelectedAsset('bitcoin');
        break;
      case 'stock':
        setSelectedAsset('AAPL');
        break;
      case 'forex':
        setSelectedAsset('EURUSD');
        break;
    }
  }, [dataSource]);

  // Calculate market metrics based on selected data source
  const getMarketMetrics = () => {
    switch (dataSource) {
      case 'crypto':
        const totalMarketCap = cryptoData.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
        const totalVolume = cryptoData.reduce((sum, coin) => sum + coin.total_volume, 0);
        const avgChange = cryptoData.length > 0 
          ? cryptoData.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / cryptoData.length
          : 0;
        const bitcoinData = cryptoData.find(coin => coin.id === 'bitcoin');
        const bitcoinDominance = bitcoinData && totalMarketCap > 0 
          ? ((bitcoinData.market_cap || 0) / totalMarketCap) * 100 
          : 42;
        return { totalMarketCap, totalVolume, avgChange, bitcoinDominance };
      
      case 'stock':
        const totalStockCap = stockData.reduce((sum, stock) => sum + stock.marketCap, 0);
        const totalStockVolume = stockData.reduce((sum, stock) => sum + stock.volume, 0);
        const avgStockChange = stockData.length > 0 
          ? stockData.reduce((sum, stock) => sum + stock.changePercent, 0) / stockData.length
          : 0;
        return { totalMarketCap: totalStockCap, totalVolume: totalStockVolume, avgChange: avgStockChange, bitcoinDominance: 0 };
      
      case 'forex':
        const totalForexVolume = forexData.reduce((sum, forex) => sum + (forex.volume || 0), 0);
        const avgForexChange = forexData.length > 0 
          ? forexData.reduce((sum, forex) => sum + forex.changePercent, 0) / forexData.length
          : 0;
        return { totalMarketCap: 0, totalVolume: totalForexVolume, avgChange: avgForexChange, bitcoinDominance: 0 };
      
      default:
        return { totalMarketCap: 0, totalVolume: 0, avgChange: 0, bitcoinDominance: 0 };
    }
  };

  const { totalMarketCap, totalVolume, avgChange, bitcoinDominance } = getMarketMetrics();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Market Prediction Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time market analysis with AI-powered predictions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-success/50 text-success">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
              Live Data
            </Badge>
            <Button 
              onClick={loadData} 
              disabled={loading}
              size="sm"
              className="bg-primary hover:bg-primary/80"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Data Source Selector */}
        <div className="flex gap-2">
          <Button
            variant={dataSource === 'crypto' ? 'default' : 'outline'}
            onClick={() => setDataSource('crypto')}
            size="sm"
          >
            Cryptocurrency
          </Button>
          <Button
            variant={dataSource === 'stock' ? 'default' : 'outline'}
            onClick={() => setDataSource('stock')}
            size="sm"
          >
            Stocks
          </Button>
          <Button
            variant={dataSource === 'forex' ? 'default' : 'outline'}
            onClick={() => setDataSource('forex')}
            size="sm"
          >
            Forex
          </Button>
        </div>

        {/* Market Overview */}
        <MarketOverview
          totalMarketCap={totalMarketCap}
          marketCapChange={avgChange}
          totalVolume={totalVolume}
          bitcoinDominance={bitcoinDominance}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Chart */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Price Analysis
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Asset:</span>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSource === 'crypto' && cryptoData.map(coin => (
                        <SelectItem key={coin.id} value={coin.id}>
                          {coin.symbol.toUpperCase()}
                        </SelectItem>
                      ))}
                      {dataSource === 'stock' && stockData.map(stock => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol}
                        </SelectItem>
                      ))}
                      {dataSource === 'forex' && forexData.map(forex => (
                        <SelectItem key={forex.symbol} value={forex.symbol}>
                          {forex.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <PriceChart 
              key={`${dataSource}-${selectedAsset}-${chartData.length}`}
              data={chartData} 
              symbol={
                dataSource === 'crypto' 
                  ? cryptoData.find(c => c.id === selectedAsset)?.symbol.toUpperCase() || 'BTC'
                  : dataSource === 'stock'
                  ? stockData.find(s => s.symbol === selectedAsset)?.symbol || 'AAPL'
                  : forexData.find(f => f.symbol === selectedAsset)?.symbol || 'EURUSD'
              } 
            />
          </div>

          {/* Investment Advice */}
          <div className="space-y-6">
            <InvestmentAdvice advice={investmentAdvice} />
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Market Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm font-medium text-success mb-1">
                    {avgChange > 0 ? 'Bullish Market' : avgChange < -2 ? 'Bearish Market' : 'Neutral Market'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Average 24h change: {avgChange.toFixed(2)}%
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">Volume Analysis</p>
                  <p className="text-xs text-muted-foreground">
                    Total 24h volume: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalVolume)}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Market Cards Grid */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {dataSource === 'crypto' && 'Top Cryptocurrencies with AI Predictions'}
            {dataSource === 'stock' && 'Top Stocks with AI Predictions'}
            {dataSource === 'forex' && 'Major Forex Pairs with AI Predictions'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {dataSource === 'crypto' && cryptoData.map((coin) => {
              const prices = coin.sparkline_in_7d?.price || [coin.current_price];
              const prediction = generatePrediction(prices);
              
              return (
                <MarketCard
                  key={coin.id}
                  symbol={coin.symbol.toUpperCase()}
                  name={coin.name}
                  price={coin.current_price}
                  change24h={coin.price_change_percentage_24h}
                  volume={coin.total_volume}
                  prediction={prediction.direction}
                  confidence={prediction.confidence}
                />
              );
            })}
            
            {dataSource === 'stock' && stockData.map((stock) => {
              const prices = [stock.open, stock.high, stock.low, stock.price];
              const prediction = generatePrediction(prices);
              
              return (
                <MarketCard
                  key={stock.symbol}
                  symbol={stock.symbol}
                  name={stock.name}
                  price={stock.price}
                  change24h={stock.changePercent}
                  volume={stock.volume}
                  prediction={prediction.direction}
                  confidence={prediction.confidence}
                />
              );
            })}
            
            {dataSource === 'forex' && forexData.map((forex) => {
              const prices = [forex.price * 0.99, forex.price * 1.01, forex.price];
              const prediction = generatePrediction(prices);
              
              return (
                <MarketCard
                  key={forex.symbol}
                  symbol={forex.symbol}
                  name={forex.name}
                  price={forex.price}
                  change24h={forex.changePercent}
                  volume={0}
                  prediction={prediction.direction}
                  confidence={prediction.confidence}
                />
              );
            })}
          </div>
        </div>

        {/* Commodities Section */}
        <CommoditiesSection commodities={commoditiesData} />

        {/* Investment Analyzer */}
        <InvestmentAnalyzer />
      </div>
    </div>
  );
};