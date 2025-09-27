import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import { Card } from '@/components/ui/card';

interface PricePoint {
  timestamp: string;
  price: number;
  prediction?: number;
  isHistorical?: boolean;
  trend?: 'bullish' | 'bearish' | 'neutral';
}

interface PriceChartProps {
  data: PricePoint[];
  symbol: string;
}

export const PriceChart = ({ data, symbol }: PriceChartProps) => {
  // Filter out invalid data points
  const validData = data.filter(point => 
    point && 
    typeof point.price === 'number' && 
    !isNaN(point.price) && 
    point.price > 0
  );

  // Separate historical and prediction data
  const historicalData = validData.filter(d => d.isHistorical !== false);
  const predictionData = validData.filter(d => d.isHistorical === false);
  
  // Get price range for better scaling
  const prices = validData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Determine prediction trend color
  const predictionTrend = predictionData[0]?.trend || 'neutral';
  const predictionColor = predictionTrend === 'bullish' ? '#10b981' : 
                         predictionTrend === 'bearish' ? '#ef4444' : '#6b7280';
  
  return (
    <Card className="p-6 bg-gradient-card border-border/50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{symbol} Price Chart</h3>
        <p className="text-sm text-muted-foreground">
          Historical data (blue) with AI predictions ({predictionTrend === 'bullish' ? 'green' : predictionTrend === 'bearish' ? 'red' : 'gray'})
        </p>
        {validData.length === 0 && (
          <p className="text-sm text-yellow-600 mt-2">
            ⚠️ No valid price data available. Using mock data.
          </p>
        )}
      </div>
      
      {validData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={validData}>
            <defs>
              <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={predictionColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={predictionColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              interval="preserveStartEnd"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              domain={[
                Math.max(0, minPrice - priceRange * 0.05), 
                maxPrice + priceRange * 0.05
              ]}
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return `$${(value / 1000).toFixed(1)}K`;
                } else if (value >= 1) {
                  return `$${value.toFixed(2)}`;
                } else {
                  return `$${value.toFixed(4)}`;
                }
              }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: any, name: string, props: any) => [
                `$${value.toLocaleString()}`, 
                props.payload.isHistorical ? 'Historical Price' : 'Predicted Price'
              ]}
              labelFormatter={(value) => new Date(value).toLocaleString()}
            />
            
            {/* Combined historical and prediction line */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorHistorical)"
              strokeWidth={2}
              dot={false}
            />
            
            {/* Prediction overlay line */}
            {predictionData.length > 0 && (
              <Line
                type="monotone"
                dataKey="price"
                stroke={predictionColor}
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={false}
                data={[...historicalData.slice(-1), ...predictionData]}
                connectNulls={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">Loading price data...</p>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded"></div>
          <span className="text-muted-foreground">Historical Data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{
            background: `repeating-linear-gradient(to right, ${predictionColor} 0px, ${predictionColor} 4px, transparent 4px, transparent 8px)`
          }}></div>
          <span className="text-muted-foreground">
            AI Predictions ({predictionTrend})
          </span>
        </div>
      </div>
    </Card>
  );
};