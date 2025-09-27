import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { analyzeInvestment, InvestmentAnalysis } from '@/lib/marketApi';

export const InvestmentAnalyzer = () => {
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetType, setAssetType] = useState<'crypto' | 'stock' | 'forex' | 'commodity'>('crypto');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M'>('1W');
  const [analysis, setAnalysis] = useState<InvestmentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!assetSymbol.trim()) {
      setError('Please enter an asset symbol');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await analyzeInvestment(assetSymbol, assetType, timeframe);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze investment');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY': return 'bg-green-500 text-white';
      case 'BUY': return 'bg-green-400 text-white';
      case 'HOLD': return 'bg-yellow-500 text-white';
      case 'SELL': return 'bg-red-400 text-white';
      case 'STRONG_SELL': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'BULLISH': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'BEARISH': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Investment Analyzer
          </h2>
          <p className="text-muted-foreground">
            Get precise predictions and analysis for any asset
          </p>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Asset Symbol
            </label>
            <Input
              placeholder="e.g., BTC, AAPL, EURUSD"
              value={assetSymbol}
              onChange={(e) => setAssetSymbol(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Asset Type
            </label>
            <Select value={assetType} onValueChange={(value: any) => setAssetType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="forex">Forex</SelectItem>
                <SelectItem value="commodity">Commodity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Timeframe
            </label>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Investment'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Analysis */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {analysis.asset} Analysis
              </h3>
              <Badge className={getRecommendationColor(analysis.recommendation)}>
                {analysis.recommendation.replace('_', ' ')}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Current Price</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    ${analysis.currentPrice.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-success/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">Predicted Price</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    ${analysis.predictedPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${analysis.expectedReturn >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Expected Return</p>
                  <p className={`text-lg font-bold ${analysis.expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.expectedReturn >= 0 ? '+' : ''}{analysis.expectedReturnPercent.toFixed(2)}%
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Confidence</p>
                  <p className="text-lg font-bold text-blue-600">
                    {analysis.confidence}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getRiskColor(analysis.riskLevel)}>
                  {analysis.riskLevel} Risk
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Timeframe: {analysis.timeframe}
                </span>
              </div>
            </div>
          </Card>

          {/* Technical Indicators */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Technical Indicators
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">RSI</span>
                <span className="font-bold text-foreground">{analysis.technicalIndicators.rsi}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Trend</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(analysis.technicalIndicators.trend)}
                  <span className="font-bold text-foreground">
                    {analysis.technicalIndicators.trend}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Volatility</span>
                <span className="font-bold text-foreground">
                  {analysis.technicalIndicators.volatility}%
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Support</span>
                  <span className="font-bold text-foreground">
                    ${analysis.technicalIndicators.support.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Resistance</span>
                  <span className="font-bold text-foreground">
                    ${analysis.technicalIndicators.resistance.toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Analysis Reasoning</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {analysis.reasoning}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Examples */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Cryptocurrencies</h4>
            <div className="flex flex-wrap gap-2">
              {['BTC', 'ETH', 'ADA', 'SOL', 'MATIC', 'DOT', 'LINK', 'UNI'].map((symbol) => (
                <Button
                  key={`${symbol}-crypto`}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAssetSymbol(symbol);
                    setAssetType('crypto');
                  }}
                  className="text-xs"
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Stocks</h4>
            <div className="flex flex-wrap gap-2">
              {['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX'].map((symbol) => (
                <Button
                  key={`${symbol}-stock`}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAssetSymbol(symbol);
                    setAssetType('stock');
                  }}
                  className="text-xs"
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Forex</h4>
            <div className="flex flex-wrap gap-2">
              {['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF'].map((symbol) => (
                <Button
                  key={`${symbol}-forex`}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAssetSymbol(symbol);
                    setAssetType('forex');
                  }}
                  className="text-xs"
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
