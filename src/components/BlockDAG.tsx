import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactions: number;
  gasUsed: string;
  difficulty: string;
}

interface BlockDAGProps {
  connectedAccount?: string;
}

export const BlockDAG = ({ connectedAccount }: BlockDAGProps) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLatestBlocks = async () => {
    if (!window.ethereum) return;
    
    setLoading(true);
    try {
      const latestBlockHex = await window.ethereum.request({
        method: 'eth_blockNumber',
      });
      const latestBlockNumber = parseInt(latestBlockHex, 16);

      const blockPromises = [];
      for (let i = 0; i < 5; i++) {
        const blockNumber = `0x${(latestBlockNumber - i).toString(16)}`;
        blockPromises.push(
          window.ethereum.request({
            method: 'eth_getBlockByNumber',
            params: [blockNumber, false],
          })
        );
      }

      const blockData = await Promise.all(blockPromises);
      const formattedBlocks = blockData.map((block: any) => ({
        number: parseInt(block.number, 16),
        hash: block.hash,
        timestamp: parseInt(block.timestamp, 16),
        transactions: block.transactions.length,
        gasUsed: parseInt(block.gasUsed, 16).toLocaleString(),
        difficulty: parseInt(block.difficulty, 16).toLocaleString(),
      }));

      setBlocks(formattedBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connectedAccount) {
      fetchLatestBlocks();
      const interval = setInterval(fetchLatestBlocks, 15000); // Refresh every 15 seconds
      return () => clearInterval(interval);
    }
  }, [connectedAccount]);

  if (!connectedAccount) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Connect MetaMask to view live blockchain data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Blockchain Data</h2>
        <Button onClick={fetchLatestBlocks} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid gap-4">
        {blocks.map((block, index) => (
          <Card key={block.hash} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Block #{block.number}</CardTitle>
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  {index === 0 ? 'Latest' : `${index} blocks ago`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Hash:</p>
                  <p className="font-mono text-xs break-all">{block.hash}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timestamp:</p>
                  <p>{new Date(block.timestamp * 1000).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transactions:</p>
                  <p className="font-semibold">{block.transactions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gas Used:</p>
                  <p>{block.gasUsed}</p>
                </div>
              </div>
              
              {/* Visual DAG representation */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-primary to-muted"></div>
                  {index < blocks.length - 1 && (
                    <>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <div className="flex-1 h-0.5 bg-muted"></div>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Block connections in DAG structure
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};