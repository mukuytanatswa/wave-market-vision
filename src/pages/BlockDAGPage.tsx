import { useState } from 'react';
import { MetaMaskConnect } from '../components/MetaMaskConnect';
import { BlockDAG } from '../components/BlockDAG';

export const BlockDAGPage = () => {
  const [connectedAccount, setConnectedAccount] = useState<string>('');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Block DAG Explorer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect your MetaMask wallet to explore live blockchain data and visualize block relationships in a DAG structure.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <MetaMaskConnect onConnect={setConnectedAccount} />
          </div>
          <div className="lg:w-2/3">
            <BlockDAG connectedAccount={connectedAccount} />
          </div>
        </div>
      </div>
    </div>
  );
};