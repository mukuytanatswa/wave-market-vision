import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskConnectProps {
  onConnect: (account: string) => void;
}

export const MetaMaskConnect = ({ onConnect }: MetaMaskConnectProps) => {
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const account = accounts[0];
        setAccount(account);
        setIsConnected(true);
        onConnect(account);
        
        // Get balance
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [account, 'latest'],
        });
        const ethBalance = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        setBalance(ethBalance);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setIsConnected(false);
    setBalance('');
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          onConnect(accounts[0]);
        }
      });
    }
  }, [onConnect]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          MetaMask Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Button onClick={connectWallet} className="w-full">
            Connect MetaMask
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Connected</Badge>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">Account:</p>
              <p className="font-mono text-xs break-all">{account}</p>
            </div>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">Balance:</p>
              <p className="font-semibold">{balance} ETH</p>
            </div>
            <Button onClick={disconnectWallet} variant="outline" className="w-full">
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};