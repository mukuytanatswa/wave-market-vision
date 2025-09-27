import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { InvestmentAdvice as IInvestmentAdvice } from '@/lib/marketApi';

interface InvestmentAdviceProps {
  advice: IInvestmentAdvice[];
}

export const InvestmentAdvice = ({ advice }: InvestmentAdviceProps) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-success/10 text-success border-success/20';
      case 'SELL':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-success/20 text-success';
      case 'MEDIUM':
        return 'bg-warning/20 text-warning';
      case 'HIGH':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/50">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Investment Recommendations</h3>
      </div>
      
      <div className="space-y-4">
        {advice.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getActionColor(item.action)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getActionIcon(item.action)}
                <span className="font-medium">{item.action} {item.asset}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRiskColor(item.risk_level)}>
                  {item.risk_level} Risk
                </Badge>
                <Badge variant="outline">
                  {item.confidence}% Confidence
                </Badge>
              </div>
            </div>
            <p className="text-sm mb-4 opacity-90">{item.reasoning}</p>
            <div className="flex justify-between items-center">
              <div className="text-xs opacity-75">
                AI-powered analysis • Updated now
              </div>
              <Button size="sm" variant="ghost" className="h-7 px-3 text-xs">
                View Details
              </Button>
            </div>
          </div>
        ))}
        
        {advice.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No specific recommendations at this time.</p>
            <p className="text-xs mt-1">Market conditions are neutral - consider holding current positions.</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> This is AI-generated analysis for educational purposes only. 
          Always conduct your own research and consult with financial advisors before making investment decisions.
        </p>
      </div>
    </Card>
  );
};