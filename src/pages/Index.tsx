import { MarketDashboard } from "@/components/MarketDashboard";
import { BlockDAGPage } from "./BlockDAGPage";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<"market" | "blockdag">("market");

  return (
    <div>
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Market Predictor</h1>
            <div className="flex gap-2">
              <Button 
                variant={currentPage === "market" ? "default" : "ghost"}
                onClick={() => setCurrentPage("market")}
              >
                Market Dashboard
              </Button>
              <Button 
                variant={currentPage === "blockdag" ? "default" : "ghost"}
                onClick={() => setCurrentPage("blockdag")}
              >
                Block DAG
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {currentPage === "market" ? <MarketDashboard /> : <BlockDAGPage />}
    </div>
  );
};

export default Index;
