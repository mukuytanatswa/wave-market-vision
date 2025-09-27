import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CommodityData } from '@/lib/marketApi';

interface CommoditiesSectionProps {
  commodities: CommodityData[];
}

export const CommoditiesSection = ({ commodities }: CommoditiesSectionProps) => {
  const formatCurrency = (value: number, symbol?: string) => {
    if (symbol === 'OIL') {
      return `$${value.toFixed(2)}/barrel`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '/oz';
  };

  const formatVolume = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Commodities Market
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commodities.map((commodity) => {
          const isPositive = commodity.price_change_percentage_24h >= 0;
          
          return (
            <Card key={commodity.id} className="p-6 bg-gradient-card border-border/50 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{commodity.name}</h3>
                  <p className="text-sm text-muted-foreground">{commodity.symbol}</p>
                </div>
                <Badge variant={isPositive ? 'default' : 'secondary'} className={
                  isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }>
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {isPositive ? '+' : ''}{commodity.price_change_percentage_24h.toFixed(2)}%
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(commodity.current_price, commodity.symbol)}
                  </p>
                </div>
                
                {commodity.volume && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-medium text-foreground">
                      {formatVolume(commodity.volume)}
                    </span>
                  </div>
                )}
                
                {commodity.market_cap && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="font-medium text-foreground">
                      {formatVolume(commodity.market_cap)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};