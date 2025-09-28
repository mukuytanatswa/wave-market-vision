import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Heart, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface NFT {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  collection: string;
  contractAddress: string;
  attributes: { trait_type: string; value: string }[];
  floorPrice?: number;
  lastSalePrice?: number;
}

interface NFTGalleryPageProps {
  connectedAccount: string;
}

export const NFTGalleryPage = ({ connectedAccount }: NFTGalleryPageProps) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchNFTs = async () => {
    if (!connectedAccount) return;

    setLoading(true);
    try {
      // Using Alchemy API as an example (you would need an API key in production)
      // For demo purposes, we'll create some mock NFT data based on popular collections
      
      // In a real implementation, you would use:
      // const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY/getNFTs/?owner=${connectedAccount}`);
      
      // For now, let's simulate some popular NFT collections
      const mockNFTs: NFT[] = [
        {
          tokenId: '1234',
          name: 'CryptoPunk #1234',
          description: 'CryptoPunks launched as a fixed set of 10,000 items in mid-2017 and became one of the inspirations for the ERC-721 standard.',
          image: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=CryptoPunk%20%231234',
          collection: 'CryptoPunks',
          contractAddress: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
          attributes: [
            { trait_type: 'Type', value: 'Human' },
            { trait_type: 'Accessory', value: 'Nerd Glasses' },
            { trait_type: 'Hair', value: 'Brown Hair' }
          ],
          floorPrice: 45.2,
          lastSalePrice: 52.1
        },
        {
          tokenId: '5678',
          name: 'Bored Ape #5678',
          description: 'The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs— unique digital collectibles living on the Ethereum blockchain.',
          image: 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=BAYC%20%235678',
          collection: 'Bored Ape Yacht Club',
          contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
          attributes: [
            { trait_type: 'Background', value: 'Blue' },
            { trait_type: 'Fur', value: 'Golden Brown' },
            { trait_type: 'Eyes', value: 'Bored' },
            { trait_type: 'Mouth', value: 'Grin' }
          ],
          floorPrice: 12.8,
          lastSalePrice: 15.2
        },
        {
          tokenId: '9876',
          name: 'Azuki #9876',
          description: 'A brand for the metaverse. Built by Chiru Labs.',
          image: 'https://via.placeholder.com/400x400/FFE66D/FFFFFF?text=Azuki%20%239876',
          collection: 'Azuki',
          contractAddress: '0xED5AF388653567Af2F388E6224dC7C4b3241C544',
          attributes: [
            { trait_type: 'Type', value: 'Human' },
            { trait_type: 'Hair', value: 'Black Samurai' },
            { trait_type: 'Eyes', value: 'Closed' },
            { trait_type: 'Clothing', value: 'Red Kimono' }
          ],
          floorPrice: 3.2,
          lastSalePrice: 4.1
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setNfts(mockNFTs);
      toast.success(`Found ${mockNFTs.length} NFTs in your wallet`);
      
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (tokenId: string) => {
    const newFavorites = favorites.includes(tokenId)
      ? favorites.filter(id => id !== tokenId)
      : [...favorites, tokenId];
    
    setFavorites(newFavorites);
    localStorage.setItem('nftFavorites', JSON.stringify(newFavorites));
    
    toast.success(
      favorites.includes(tokenId) 
        ? 'Removed from favorites' 
        : 'Added to favorites'
    );
  };

  const shareNFT = (nft: NFT) => {
    const shareUrl = `https://opensea.io/assets/${nft.contractAddress}/${nft.tokenId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('NFT link copied to clipboard');
  };

  useEffect(() => {
    if (connectedAccount) {
      fetchNFTs();
      
      // Load favorites from localStorage
      const savedFavorites = JSON.parse(localStorage.getItem('nftFavorites') || '[]');
      setFavorites(savedFavorites);
    }
  }, [connectedAccount]);

  if (!connectedAccount) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">NFT Gallery</h2>
        <p className="text-muted-foreground">Please connect your MetaMask wallet to view your NFT collection.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">NFT Gallery</h1>
        <Button onClick={fetchNFTs} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Gallery Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{nfts.length}</div>
            <p className="text-sm text-muted-foreground">Total NFTs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{new Set(nfts.map(nft => nft.collection)).size}</div>
            <p className="text-sm text-muted-foreground">Collections</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{favorites.length}</div>
            <p className="text-sm text-muted-foreground">Favorites</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {nfts.reduce((sum, nft) => sum + (nft.floorPrice || 0), 0).toFixed(1)} ETH
            </div>
            <p className="text-sm text-muted-foreground">Est. Floor Value</p>
          </CardContent>
        </Card>
      </div>

      {/* NFT Grid */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading your NFT collection...</p>
        </div>
      ) : nfts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">No NFTs found in your wallet</p>
            <p className="text-sm text-muted-foreground">
              Your NFTs will appear here once you own some. You can browse and purchase NFTs on marketplaces like OpenSea.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img 
                  src={nft.image} 
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleFavorite(nft.tokenId)}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(nft.tokenId) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    onClick={() => shareNFT(nft)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{nft.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">{nft.collection}</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {nft.description}
                </p>
                
                {/* Attributes */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Traits:</p>
                  <div className="flex flex-wrap gap-1">
                    {nft.attributes.slice(0, 3).map((attr, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {attr.trait_type}: {attr.value}
                      </Badge>
                    ))}
                    {nft.attributes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{nft.attributes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Price Info */}
                {(nft.floorPrice || nft.lastSalePrice) && (
                  <div className="flex justify-between text-sm">
                    {nft.floorPrice && (
                      <div>
                        <p className="text-muted-foreground">Floor</p>
                        <p className="font-semibold">{nft.floorPrice} ETH</p>
                      </div>
                    )}
                    {nft.lastSalePrice && (
                      <div className="text-right">
                        <p className="text-muted-foreground">Last Sale</p>
                        <p className="font-semibold">{nft.lastSalePrice} ETH</p>
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.open(`https://opensea.io/assets/${nft.contractAddress}/${nft.tokenId}`, '_blank')}
                >
                  View on OpenSea
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};