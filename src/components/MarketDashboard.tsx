import { useState, useEffect } from 'react';
import { MarketOverview } from './MarketOverview';
import { MarketCard } from './MarketCard';
import { PriceChart } from './PriceChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, BarChart3, TrendingUp } from 'lucide-react';
import { fetchCryptoData, fetchPriceHistory, generatePrediction, CoinData, PriceHistoryPoint } from '@/lib/marketApi';

export const MarketDashboard = () => {
  const [cryptoData, setCryptoData] = useState<CoinData[]>([]);
  const [chartData, setChartData] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCoin, setSelectedCoin] = useState<string>('bitcoin');

  const loadData = async () => {
    setLoading(true);
    try {
      const [coins, priceHistory] = await Promise.all([
        fetchCryptoData(8),
        fetchPriceHistory(selectedCoin)
      ]);
      
      setCryptoData(coins);
      setChartData(priceHistory);
      setLastUpdate(new Date());
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
  }, [selectedCoin]);

  const totalMarketCap = cryptoData.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
  const totalVolume = cryptoData.reduce((sum, coin) => sum + coin.total_volume, 0);
  const avgChange = cryptoData.length > 0 
    ? cryptoData.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / cryptoData.length
    : 0;

  const bitcoinData = cryptoData.find(coin => coin.id === 'bitcoin');
  const bitcoinDominance = bitcoinData && totalMarketCap > 0 
    ? ((bitcoinData.market_cap || 0) / totalMarketCap) * 100 
    : 42;

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
              Real-time crypto analysis with AI-powered predictions
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
                <div className="flex gap-2">
                  {cryptoData.slice(0, 4).map(coin => (
                    <Button
                      key={coin.id}
                      variant={selectedCoin === coin.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCoin(coin.id)}
                      className="text-xs"
                    >
                      {coin.symbol.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <PriceChart 
              data={chartData} 
              symbol={cryptoData.find(c => c.id === selectedCoin)?.symbol.toUpperCase() || 'BTC'} 
            />
          </div>

          {/* Market Insights */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Market Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm font-medium text-success mb-1">Strong Bullish Signal</p>
                  <p className="text-xs text-muted-foreground">
                    Technical indicators show positive momentum across major cryptocurrencies
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary mb-1">High Volume Activity</p>
                  <p className="text-xs text-muted-foreground">
                    Trading volume is 23% above 30-day average
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Crypto Cards Grid */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Top Cryptocurrencies with AI Predictions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cryptoData.map((coin) => {
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
          </div>
        </div>
      </div>
    </div>
  );
};