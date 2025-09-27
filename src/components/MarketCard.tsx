import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketCardProps {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export const MarketCard = ({ 
  symbol, 
  name, 
  price, 
  change24h, 
  volume,
  prediction,
  confidence 
}: MarketCardProps) => {
  const isPositive = change24h >= 0;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(price);

  const formattedVolume = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact'
  }).format(volume);

  return (
    <Card className="bg-gradient-card p-6 hover:shadow-glow transition-all duration-300 border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <Badge 
          variant={prediction === 'bullish' ? 'default' : prediction === 'bearish' ? 'destructive' : 'secondary'}
          className={prediction === 'bullish' ? 'bg-success text-success-foreground' : ''}
        >
          {prediction.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">{formattedPrice}</span>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}{change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Volume: {formattedVolume}</span>
          <span>Confidence: {confidence}%</span>
        </div>
      </div>
    </Card>
  );
};