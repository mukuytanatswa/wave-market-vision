import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface MarketOverviewProps {
  totalMarketCap: number;
  marketCapChange: number;
  totalVolume: number;
  bitcoinDominance: number;
}

export const MarketOverview = ({ 
  totalMarketCap, 
  marketCapChange, 
  totalVolume, 
  bitcoinDominance 
}: MarketOverviewProps) => {
  const isPositiveChange = marketCapChange >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Market Cap</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalMarketCap)}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className={`flex items-center gap-2 mt-3 ${isPositiveChange ? 'text-success' : 'text-destructive'}`}>
          {isPositiveChange ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isPositiveChange ? '+' : ''}{marketCapChange.toFixed(2)}% (24h)
          </span>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalVolume)}</p>
          </div>
          <div className="p-3 bg-success/10 rounded-full">
            <Activity className="w-6 h-6 text-success" />
          </div>
        </div>
        <Badge variant="secondary" className="mt-3">
          Active Trading
        </Badge>
      </Card>

      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">BTC Dominance</p>
            <p className="text-2xl font-bold text-foreground">{bitcoinDominance.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-chart-4/10 rounded-full">
            <TrendingUp className="w-6 h-6 text-chart-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-chart-4 h-2 rounded-full transition-all duration-500"
              style={{ width: `${bitcoinDominance}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-primary border-border/50 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">AI Prediction</p>
            <p className="text-2xl font-bold">Bullish</p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            87% Confidence
          </Badge>
        </div>
        <p className="text-sm text-white/80 mt-3">
          Market indicators suggest upward momentum
        </p>
      </Card>
    </div>
  );
};