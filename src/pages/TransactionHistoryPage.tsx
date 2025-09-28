import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  type: 'sent' | 'received';
  blockNumber: string;
}

interface TransactionHistoryPageProps {
  connectedAccount: string;
}

export const TransactionHistoryPage = ({ connectedAccount }: TransactionHistoryPageProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed' | 'pending'>('all');

  const fetchTransactions = async () => {
    if (!connectedAccount || !window.ethereum) return;

    setLoading(true);
    try {
      // Get latest block number
      const latestBlock = await window.ethereum.request({
        method: 'eth_blockNumber',
        params: []
      });
      
      const latestBlockNum = parseInt(latestBlock, 16);
      const fromBlock = Math.max(0, latestBlockNum - 10000); // Last ~10000 blocks

      // Fetch transactions where account is sender
      const sentTxs = await window.ethereum.request({
        method: 'eth_getLogs',
        params: [{
          fromBlock: `0x${fromBlock.toString(16)}`,
          toBlock: 'latest',
          topics: [
            null,
            `0x000000000000000000000000${connectedAccount.slice(2)}`
          ]
        }]
      });

      // Fetch transactions where account is receiver
      const receivedTxs = await window.ethereum.request({
        method: 'eth_getLogs',
        params: [{
          fromBlock: `0x${fromBlock.toString(16)}`,
          toBlock: 'latest',
          topics: [
            null,
            null,
            `0x000000000000000000000000${connectedAccount.slice(2)}`
          ]
        }]
      });

      // For demonstration, let's fetch recent blocks and check for transactions
      const recentTransactions: Transaction[] = [];
      
      for (let i = 0; i < 10; i++) {
        try {
          const blockNum = latestBlockNum - i;
          const block = await window.ethereum.request({
            method: 'eth_getBlockByNumber',
            params: [`0x${blockNum.toString(16)}`, true]
          });

          if (block && block.transactions) {
            const userTxs = block.transactions.filter((tx: any) => 
              tx.from?.toLowerCase() === connectedAccount.toLowerCase() || 
              tx.to?.toLowerCase() === connectedAccount.toLowerCase()
            );

            for (const tx of userTxs) {
              const receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [tx.hash]
              });

              const transaction: Transaction = {
                hash: tx.hash,
                from: tx.from,
                to: tx.to || '',
                value: (parseInt(tx.value, 16) / Math.pow(10, 18)).toFixed(6),
                gasUsed: receipt ? (parseInt(receipt.gasUsed, 16)).toString() : '0',
                gasPrice: (parseInt(tx.gasPrice, 16) / Math.pow(10, 9)).toFixed(2),
                timestamp: parseInt(block.timestamp, 16),
                status: receipt && receipt.status === '0x1' ? 'success' : 'failed',
                type: tx.from.toLowerCase() === connectedAccount.toLowerCase() ? 'sent' : 'received',
                blockNumber: blockNum.toString()
              };

              recentTransactions.push(transaction);
            }
          }
        } catch (error) {
          console.error(`Error fetching block ${latestBlockNum - i}:`, error);
        }
      }

      // Sort by timestamp (newest first)
      recentTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(recentTransactions.slice(0, 50)); // Limit to 50 transactions

    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectedAccount) {
      fetchTransactions();
    }
  }, [connectedAccount]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!connectedAccount) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <p className="text-muted-foreground">Please connect your MetaMask wallet to view your transaction history.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <Button onClick={fetchTransactions} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by hash or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((tx, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'sent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {tx.type === 'sent' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{tx.type === 'sent' ? 'Sent' : 'Received'}</span>
                          <Badge variant={tx.status === 'success' ? 'default' : tx.status === 'failed' ? 'destructive' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Hash:</strong> 
                            <a 
                              href={`https://etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-primary hover:underline inline-flex items-center"
                            >
                              {formatAddress(tx.hash)}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </p>
                          <p><strong>From:</strong> {formatAddress(tx.from)}</p>
                          <p><strong>To:</strong> {formatAddress(tx.to)}</p>
                          <p><strong>Block:</strong> {tx.blockNumber}</p>
                          <p><strong>Time:</strong> {formatTimestamp(tx.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-lg font-semibold">
                        {tx.value} ETH
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Gas: {tx.gasUsed} ({tx.gasPrice} Gwei)
                      </div>
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