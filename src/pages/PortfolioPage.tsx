import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  value: number;
  change24h: number;
  address?: string;
}

interface PortfolioPageProps {
  connectedAccount: string;
}

export const PortfolioPage = ({ connectedAccount }: PortfolioPageProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [portfolioHistory, setPortfolioHistory] = useState<any[]>([]);

  const fetchPortfolioData = async () => {
    if (!connectedAccount || !window.ethereum) return;

    setLoading(true);
    try {
      // Fetch ETH balance
      const ethBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [connectedAccount, 'latest'],
      });
      const ethAmount = parseFloat((parseInt(ethBalance, 16) / Math.pow(10, 18)).toFixed(6));

      // Fetch ETH price
      const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true');
      const ethPriceData = await ethPriceResponse.json();
      const ethPrice = ethPriceData.ethereum.usd;
      const ethChange = ethPriceData.ethereum.usd_24h_change;

      // Common ERC-20 tokens to check
      const commonTokens = [
        { address: '0xA0b86a33E6441E2B7b16c34c6F8bf2c48C0d05e2', symbol: 'USDC', decimals: 6 },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
        { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', decimals: 18 },
        { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', decimals: 18 }
      ];

      const tokenBalances = await Promise.all(
        commonTokens.map(async (token) => {
          try {
            const balance = await window.ethereum.request({
              method: 'eth_call',
              params: [
                {
                  to: token.address,
                  data: `0x70a08231000000000000000000000000${connectedAccount.slice(2)}`
                },
                'latest'
              ]
            });
            
            const balanceAmount = parseInt(balance, 16) / Math.pow(10, token.decimals);
            
            if (balanceAmount > 0) {
              // Fetch token price
              const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token.address}&vs_currencies=usd&include_24hr_change=true`);
              const priceData = await priceResponse.json();
              const tokenData = priceData[token.address.toLowerCase()];
              
              return {
                symbol: token.symbol,
                name: token.symbol,
                balance: balanceAmount.toFixed(6),
                price: tokenData?.usd || 0,
                value: balanceAmount * (tokenData?.usd || 0),
                change24h: tokenData?.usd_24h_change || 0,
                address: token.address
              };
            }
            return null;
          } catch (error) {
            return null;
          }
        })
      );

      const validTokens = tokenBalances.filter(token => token !== null) as Token[];

      const ethToken: Token = {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethAmount.toString(),
        price: ethPrice,
        value: ethAmount * ethPrice,
        change24h: ethChange
      };

      const allTokens = [ethToken, ...validTokens];
      setTokens(allTokens);

      const total = allTokens.reduce((sum, token) => sum + token.value, 0);
      setTotalValue(total);

      const weightedChange = allTokens.reduce((sum, token) => {
        const weight = token.value / total;
        return sum + (token.change24h * weight);
      }, 0);
      setTotalChange(weightedChange);

      // Generate mock portfolio history for chart
      const history = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: total * (1 + (Math.random() - 0.5) * 0.1)
      }));
      setPortfolioHistory(history);

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectedAccount) {
      fetchPortfolioData();
    }
  }, [connectedAccount]);

  if (!connectedAccount) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Portfolio Dashboard</h2>
        <p className="text-muted-foreground">Please connect your MetaMask wallet to view your portfolio.</p>
      </div>
    );
  }

  const pieData = tokens.map((token, index) => ({
    name: token.symbol,
    value: token.value,
    color: `hsl(${index * 45}, 70%, 50%)`
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
        <Button onClick={fetchPortfolioData} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center text-sm ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {totalChange.toFixed(2)}% (24h)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokens.length}</div>
            <p className="text-sm text-muted-foreground">Different tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Largest Holding</CardTitle>
          </CardHeader>
          <CardContent>
            {tokens.length > 0 && (
              <>
                <div className="text-2xl font-bold">{tokens[0].symbol}</div>
                <p className="text-sm text-muted-foreground">
                  ${tokens[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioHistory}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Portfolio Value']} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Token List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-bold text-sm">{token.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{token.name}</h3>
                    <p className="text-sm text-muted-foreground">{token.balance} {token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${token.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <Badge variant={token.change24h >= 0 ? "default" : "destructive"}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};