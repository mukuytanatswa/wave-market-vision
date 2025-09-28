import { MarketDashboard } from "@/components/MarketDashboard";
import { BlockDAGPage } from "./BlockDAGPage";
import { PortfolioPage } from "./PortfolioPage";
import { TransactionHistoryPage } from "./TransactionHistoryPage";
import { TokenManagementPage } from "./TokenManagementPage";
import { NFTGalleryPage } from "./NFTGalleryPage";
import { MetaMaskConnect } from "@/components/MetaMaskConnect";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type PageType = "market" | "blockdag" | "portfolio" | "transactions" | "tokens" | "nfts";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<PageType>("market");
  const [connectedAccount, setConnectedAccount] = useState<string>('');

  const renderPage = () => {
    switch (currentPage) {
      case "market":
        return <MarketDashboard />;
      case "blockdag":
        return <BlockDAGPage />;
      case "portfolio":
        return <PortfolioPage connectedAccount={connectedAccount} />;
      case "transactions":
        return <TransactionHistoryPage connectedAccount={connectedAccount} />;
      case "tokens":
        return <TokenManagementPage connectedAccount={connectedAccount} />;
      case "nfts":
        return <NFTGalleryPage connectedAccount={connectedAccount} />;
      default:
        return <MarketDashboard />;
    }
  };

  return (
    <div>
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">DeFi Trading Platform</h1>
              <div className="flex gap-1">
                <Button 
                  size="sm"
                  variant={currentPage === "market" ? "default" : "ghost"}
                  onClick={() => setCurrentPage("market")}
                >
                  Markets
                </Button>
                <Button 
                  size="sm"
                  variant={currentPage === "blockdag" ? "default" : "ghost"}
                  onClick={() => setCurrentPage("blockdag")}
                >
                  Blockchain
                </Button>
                <Button 
                  size="sm"
                  variant={currentPage === "portfolio" ? "default" : "ghost"}
                  onClick={() => setCurrentPage("portfolio")}
                >
                  Portfolio
                </Button>
                <Button 
                  size="sm"
                  variant={currentPage === "transactions" ? "default" : "ghost"}
                  onClick={() => setCurrentPage("transactions")}
                >
                  Transactions
                </Button>
                <Button 
                  size="sm"
                  variant={currentPage === "tokens" ? "default" : "ghost"}
                  onClick={() => setCurrentPage("tokens")}
                >
                  Tokens
                </Button>
                <Button 
                  size="sm"
                  variant={currentPage === "nfts" ? "default" : "ghost"}
                  onClick={() => setCurrentPage("nfts")}
                >
                  NFTs
                </Button>
              </div>
            </div>
            
            {/* Wallet Connection */}
            <div className="flex items-center gap-4">
              {!connectedAccount ? (
                <div className="w-64">
                  <MetaMaskConnect onConnect={setConnectedAccount} />
                </div>
              ) : (
                <div className="text-sm">
                  <span className="text-muted-foreground">Connected: </span>
                  <span className="font-mono">{connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {renderPage()}
    </div>
  );
};

export default Index;
