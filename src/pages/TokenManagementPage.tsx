import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RefreshCw, Plus, Trash2, Star, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  price: number;
  value: number;
  change24h: number;
  isCustom: boolean;
}

interface TokenManagementPageProps {
  connectedAccount: string;
}

export const TokenManagementPage = ({ connectedAccount }: TokenManagementPageProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Popular tokens to display by default
  const popularTokens = [
    { address: '0xA0b86a33E6441E2B7b16c34c6F8bf2c48C0d05e2', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18 },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18 },
    { address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: 'MATIC', name: 'Polygon', decimals: 18 },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
    { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', symbol: 'AAVE', name: 'Aave', decimals: 18 },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 }
  ];

  const fetchTokenData = async (tokenList: typeof popularTokens) => {
    if (!connectedAccount || !window.ethereum) return [];

    const tokenData: Token[] = [];

    for (const token of tokenList) {
      try {
        // Get token balance
        const balanceHex = await window.ethereum.request({
          method: 'eth_call',
          params: [
            {
              to: token.address,
              data: `0x70a08231000000000000000000000000${connectedAccount.slice(2)}`
            },
            'latest'
          ]
        });
        
        const balance = parseInt(balanceHex, 16) / Math.pow(10, token.decimals);

        // Get token price from CoinGecko
        let price = 0;
        let change24h = 0;
        let value = 0;

        try {
          const priceResponse = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token.address}&vs_currencies=usd&include_24hr_change=true`
          );
          
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            const tokenPriceData = priceData[token.address.toLowerCase()];
            
            if (tokenPriceData) {
              price = tokenPriceData.usd || 0;
              change24h = tokenPriceData.usd_24h_change || 0;
              value = balance * price;
            }
          }
        } catch (error) {
          console.error(`Error fetching price for ${token.symbol}:`, error);
        }

        tokenData.push({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          balance: balance.toFixed(6),
          price,
          value,
          change24h,
          isCustom: !popularTokens.some(p => p.address === token.address)
        });

      } catch (error) {
        console.error(`Error fetching data for ${token.symbol}:`, error);
      }
    }

    return tokenData;
  };

  const loadTokens = async () => {
    setLoading(true);
    try {
      // Load custom tokens from localStorage
      const customTokens = JSON.parse(localStorage.getItem('customTokens') || '[]');
      const allTokens = [...popularTokens, ...customTokens];
      
      const tokenData = await fetchTokenData(allTokens);
      setTokens(tokenData);

      // Load watchlist
      const savedWatchlist = JSON.parse(localStorage.getItem('tokenWatchlist') || '[]');
      setWatchlist(savedWatchlist);

    } catch (error) {
      console.error('Error loading tokens:', error);
      toast.error('Failed to load token data');
    } finally {
      setLoading(false);
    }
  };

  const addCustomToken = async () => {
    if (!newTokenAddress || !window.ethereum) return;

    try {
      // Validate address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(newTokenAddress)) {
        toast.error('Invalid token address format');
        return;
      }

      // Get token info
      const symbolHex = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: newTokenAddress,
            data: '0x95d89b41' // symbol()
          },
          'latest'
        ]
      });

      const nameHex = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: newTokenAddress,
            data: '0x06fdde03' // name()
          },
          'latest'
        ]
      });

      const decimalsHex = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: newTokenAddress,
            data: '0x313ce567' // decimals()
          },
          'latest'
        ]
      });

      // Parse the results - convert hex to string
      const hexToString = (hex: string) => {
        try {
          const cleanHex = hex.replace('0x', '');
          let str = '';
          for (let i = 0; i < cleanHex.length; i += 2) {
            const charCode = parseInt(cleanHex.substr(i, 2), 16);
            if (charCode !== 0) str += String.fromCharCode(charCode);
          }
          return str || 'UNKNOWN';
        } catch {
          return 'UNKNOWN';
        }
      };
      
      const symbol = hexToString(symbolHex);
      const name = hexToString(nameHex);
      const decimals = parseInt(decimalsHex, 16);

      const newToken = {
        address: newTokenAddress,
        symbol: symbol.replace(/\0/g, ''),
        name: name.replace(/\0/g, ''),
        decimals: decimals || 18
      };

      // Save to localStorage
      const customTokens = JSON.parse(localStorage.getItem('customTokens') || '[]');
      const updatedTokens = [...customTokens, newToken];
      localStorage.setItem('customTokens', JSON.stringify(updatedTokens));

      // Refresh token list
      await loadTokens();
      
      setAddDialogOpen(false);
      setNewTokenAddress('');
      toast.success(`Added ${newToken.symbol} to your token list`);

    } catch (error) {
      console.error('Error adding custom token:', error);
      toast.error('Failed to add token. Please check the address.');
    }
  };

  const removeCustomToken = async (address: string) => {
    const customTokens = JSON.parse(localStorage.getItem('customTokens') || '[]');
    const updatedTokens = customTokens.filter((token: any) => token.address !== address);
    localStorage.setItem('customTokens', JSON.stringify(updatedTokens));
    
    await loadTokens();
    toast.success('Token removed from your list');
  };

  const toggleWatchlist = (address: string) => {
    const newWatchlist = watchlist.includes(address)
      ? watchlist.filter(addr => addr !== address)
      : [...watchlist, address];
    
    setWatchlist(newWatchlist);
    localStorage.setItem('tokenWatchlist', JSON.stringify(newWatchlist));
    
    toast.success(
      watchlist.includes(address) 
        ? 'Removed from watchlist' 
        : 'Added to watchlist'
    );
  };

  useEffect(() => {
    if (connectedAccount) {
      loadTokens();
    }
  }, [connectedAccount]);

  if (!connectedAccount) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Token Management</h2>
        <p className="text-muted-foreground">Please connect your MetaMask wallet to manage your tokens.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Token Management</h1>
        <div className="flex gap-2">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Token
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Token</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tokenAddress">Token Contract Address</Label>
                  <Input
                    id="tokenAddress"
                    placeholder="0x..."
                    value={newTokenAddress}
                    onChange={(e) => setNewTokenAddress(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addCustomToken}>
                    Add Token
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={loadTokens} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Token Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tokens.length}</div>
            <p className="text-sm text-muted-foreground">Total Tokens</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tokens.filter(t => parseFloat(t.balance) > 0).length}</div>
            <p className="text-sm text-muted-foreground">With Balance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{watchlist.length}</div>
            <p className="text-sm text-muted-foreground">Watchlist</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tokens.filter(t => t.isCustom).length}</div>
            <p className="text-sm text-muted-foreground">Custom Tokens</p>
          </CardContent>
        </Card>
      </div>

      {/* Token List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading tokens...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm">{token.symbol.slice(0, 3)}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{token.name}</h3>
                        <Badge variant="outline">{token.symbol}</Badge>
                        {token.isCustom && (
                          <Badge variant="secondary">Custom</Badge>
                        )}
                        {watchlist.includes(token.address) && (
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Balance: {token.balance} {token.symbol}</p>
                        <p>Contract: {token.address.slice(0, 10)}...{token.address.slice(-8)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {token.price > 0 ? (
                        <>
                          <p className="font-semibold">${token.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={token.change24h >= 0 ? "default" : "destructive"}>
                              {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Value: ${token.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center text-muted-foreground">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Price unavailable</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleWatchlist(token.address)}
                      >
                        <Star className={`w-4 h-4 ${watchlist.includes(token.address) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      
                      {token.isCustom && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeCustomToken(token.address)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};